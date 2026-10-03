package com.cropdeal.priceservice.service;

import com.cropdeal.priceservice.config.RabbitMQConfig;
import com.cropdeal.priceservice.dto.CropListingEvent;
import com.cropdeal.priceservice.dto.DealerBuyingRequestEvent;
import com.cropdeal.priceservice.dto.PriceAlertTriggeredEvent;
import com.cropdeal.priceservice.entity.*;
import com.cropdeal.priceservice.repository.PriceAlertNotificationRepository;
import com.cropdeal.priceservice.repository.PriceAlertSubscriptionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PriceAlertMatchingService {

    private static final Logger log = LoggerFactory.getLogger(PriceAlertMatchingService.class);

    private final PriceAlertSubscriptionRepository subscriptionRepository;
    private final PriceAlertNotificationRepository notificationRepository;
    private final RabbitTemplate rabbitTemplate;

    public PriceAlertMatchingService(
            PriceAlertSubscriptionRepository subscriptionRepository,
            PriceAlertNotificationRepository notificationRepository,
            RabbitTemplate rabbitTemplate) {
        this.subscriptionRepository = subscriptionRepository;
        this.notificationRepository = notificationRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    /**
     * Triggered for Farmer Crop Listing (Selling Price):
     * Matches active DEALER subscriptions only.
     */
    @Transactional
    public void processFarmerListing(CropListingEvent event) {
        if (event == null || event.getCommodity() == null || event.getPricePerKg() == null) {
            return;
        }

        log.info("Processing farmer listing price alert matching for cropId={}, commodity={}, price={}",
                event.getCropId(), event.getCommodity(), event.getPricePerKg());

        matchAndNotify(
                event.getCommodity(),
                event.getPricePerKg(),
                event.getUnit() != null ? event.getUnit() : "KG",
                event.getDistrict(),
                event.getDistrict(),
                event.getState(),
                SourceType.FARMER_LISTING,
                String.valueOf(event.getCropId()),
                event.getQuantity(),
                "DEALER"
        );
    }

    /**
     * Triggered for Dealer Buying Request (Buying Price):
     * Matches active FARMER subscriptions only.
     */
    @Transactional
    public void processDealerBuyingRequest(DealerBuyingRequestEvent event) {
        if (event == null || event.getCropName() == null || event.getBuyingPrice() == null) {
            return;
        }

        log.info("Processing dealer buying request price alert matching for requestId={}, cropName={}, price={}",
                event.getRequestId(), event.getCropName(), event.getBuyingPrice());

        matchAndNotify(
                event.getCropName(),
                event.getBuyingPrice(),
                event.getUnit() != null ? event.getUnit() : "KG",
                event.getDistrict(),
                event.getDistrict(),
                event.getState(),
                SourceType.DEALER_BUYING_REQUEST,
                String.valueOf(event.getRequestId()),
                event.getQuantity(),
                "FARMER"
        );
    }

    /**
     * Triggered for Government Market Price (Daily Mandi Price):
     * Matches active DEALER and FARMER subscriptions.
     */
    @Transactional
    public void processGovernmentPrice(MarketPrice price) {
        if (price == null || price.getCommodity() == null) {
            return;
        }

        Double priceVal = price.getModalPricePerKg() != null ? price.getModalPricePerKg() : price.getMinPricePerKg();
        if (priceVal == null || priceVal <= 0) {
            return;
        }

        BigDecimal pricePerKg = BigDecimal.valueOf(priceVal).setScale(2, RoundingMode.HALF_UP);
        String sourceId = (price.getId() != null ? price.getId().toString() : "0") + "_"
                + (price.getArrivalDate() != null ? price.getArrivalDate().toString() : "today");

        matchAndNotify(
                price.getCommodity(),
                pricePerKg,
                "KG",
                price.getMarket(),
                price.getDistrict(),
                price.getState(),
                SourceType.GOVERNMENT_MARKET_PRICE,
                sourceId,
                null,
                null
        );
    }

    /**
     * Central Reusable Matching Logic
     */
    public void matchAndNotify(
            String cropName,
            BigDecimal price,
            String unit,
            String market,
            String district,
            String state,
            SourceType sourceType,
            String sourceId,
            BigDecimal quantity,
            String targetRole) {

        List<PriceAlertSubscription> candidates = new ArrayList<>();
        if (targetRole != null) {
            candidates.addAll(subscriptionRepository.findByStatusAndUserRole(PriceAlertStatus.ACTIVE, targetRole));
        } else {
            candidates.addAll(subscriptionRepository.findByStatus(PriceAlertStatus.ACTIVE));
            for (PriceAlertSubscription s : subscriptionRepository.findByActiveTrue()) {
                if (s.getStatus() == null && !candidates.contains(s)) {
                    candidates.add(s);
                }
            }
        }

        log.info("PriceAlertMatching: matchAndNotify cropName={}, price={}, market={}, district={}, state={}. Found {} candidates.",
                cropName, price, market, district, state, candidates.size());

        for (PriceAlertSubscription sub : candidates) {
            // Must be ACTIVE
            if (sub.getStatus() != null && sub.getStatus() != PriceAlertStatus.ACTIVE) {
                continue;
            }
            if (!Boolean.TRUE.equals(sub.getActive()) && sub.getStatus() != PriceAlertStatus.ACTIVE) {
                continue;
            }

            if (!matchesCrop(sub.getCropName(), cropName)) {
                log.info("Crop does not match: subCrop='{}' vs eventCrop='{}'", sub.getCropName(), cropName);
                continue;
            }

            String subLoc = sub.getMandi() != null ? sub.getMandi() : sub.getDistrict();
            if (!matchesLocation(subLoc, market, district, sub.getState(), state)) {
                log.info("Location does not match: subLoc='{}', subState='{}' vs market='{}', district='{}', state='{}'",
                        subLoc, sub.getState(), market, district, state);
                continue;
            }

            BigDecimal normalizedCurrentPrice = normalizePriceToKg(price, unit);
            BigDecimal normalizedTargetPrice = normalizePriceToKg(sub.getTargetPrice(), sub.getUnit());

            // Strict BigDecimal.compareTo() evaluation
            if (!evaluatesCondition(normalizedCurrentPrice, normalizedTargetPrice, sub.getPriceCondition())) {
                log.info("Condition not met: current={}, target={}, condition={}",
                        normalizedCurrentPrice, normalizedTargetPrice, sub.getPriceCondition());
                continue;
            }

            // Idempotency check: unique (subscriptionId, sourceType, sourceId)
            if (notificationRepository.existsBySubscriptionIdAndSourceTypeAndSourceId(sub.getId(), sourceType.name(), sourceId)) {
                log.info("Duplicate price alert skipped for subscriptionId={}, sourceType={}, sourceId={}",
                        sub.getId(), sourceType, sourceId);
                continue;
            }

            // Record notification for idempotency
            PriceAlertNotification notifRecord = new PriceAlertNotification(
                    sub.getId(),
                    sourceType.name(),
                    sourceId,
                    LocalDateTime.now()
            );
            notificationRepository.save(notifRecord);

            // Change alert status from ACTIVE to TRIGGERED and save triggered timestamp
            sub.setStatus(PriceAlertStatus.TRIGGERED);
            sub.setActive(false);
            sub.setTriggeredAt(LocalDateTime.now());
            sub.setLastNotifiedAt(LocalDateTime.now());
            subscriptionRepository.save(sub);

            String resolvedLoc = (sub.getMandi() != null && !sub.getMandi().isBlank()) ? sub.getMandi()
                    : (market != null && !market.isBlank()) ? market
                    : (district != null && !district.isBlank()) ? district : "";

            // Build and publish event
            PriceAlertTriggeredEvent event = new PriceAlertTriggeredEvent();
            event.setSubscriptionId(sub.getId());
            event.setUserId(sub.getUserId());
            event.setUserRole(sub.getUserRole());
            event.setSourceType(sourceType.name());
            event.setSourceId(sourceId);
            event.setCropName(cropName);
            event.setDistrict(resolvedLoc);
            event.setState(state);
            event.setTargetPrice(sub.getTargetPrice());
            event.setCurrentPrice(price);
            event.setQuantity(quantity);
            event.setUnit(sub.getUnit());
            event.setPriceCondition(sub.getPriceCondition().name());
            event.setMessage(buildMessage(sub, cropName, normalizedCurrentPrice, quantity, resolvedLoc, sourceType));

            try {
                rabbitTemplate.convertAndSend(
                        RabbitMQConfig.PRICE_ALERT_EXCHANGE,
                        RabbitMQConfig.PRICE_ALERT_ROUTING_KEY,
                        event
                );
                log.info("Published PriceAlertTriggeredEvent for user {} (Role: {}), crop: {}, currentPrice: {}, targetPrice: {}",
                        sub.getUserId(), sub.getUserRole(), cropName, price, sub.getTargetPrice());
            } catch (Exception e) {
                log.error("Failed to publish price alert event to RabbitMQ: {}", e.getMessage(), e);
            }
        }
    }

    public boolean matchesCrop(String subCrop, String eventCrop) {
        if (subCrop == null || eventCrop == null) return false;
        String s1 = normalizeString(subCrop);
        String s2 = normalizeString(eventCrop);
        return s1.equalsIgnoreCase(s2) || s1.toLowerCase().contains(s2.toLowerCase()) || s2.toLowerCase().contains(s1.toLowerCase());
    }

    public boolean matchesLocation(String subLocation, String eventMarket, String eventDistrict, String subState, String eventState) {
        if (subLocation != null && !subLocation.isBlank()) {
            String normSub = normalizeString(subLocation).toLowerCase();
            boolean matchMarket = (eventMarket != null && normalizeString(eventMarket).toLowerCase().contains(normSub));
            boolean matchDistrict = (eventDistrict != null && normalizeString(eventDistrict).toLowerCase().contains(normSub));
            boolean reverseMatch = (eventMarket != null && normSub.contains(normalizeString(eventMarket).toLowerCase()))
                    || (eventDistrict != null && normSub.contains(normalizeString(eventDistrict).toLowerCase()));
            if (!matchMarket && !matchDistrict && !reverseMatch) {
                return false;
            }
        }
        if (subState != null && !subState.isBlank()) {
            if (eventState == null || !normalizeString(subState).equalsIgnoreCase(normalizeString(eventState))) {
                return false;
            }
        }
        return true;
    }

    public boolean evaluatesCondition(BigDecimal current, BigDecimal target, PriceCondition condition) {
        if (current == null || target == null || condition == null) return false;
        int cmp = current.compareTo(target);
        return switch (condition) {
            case ABOVE, GREATER_THAN_OR_EQUAL -> cmp >= 0;
            case BELOW, LESS_THAN_OR_EQUAL -> cmp <= 0;
            case GREATER_THAN -> cmp > 0;
            case LESS_THAN -> cmp < 0;
            case EQUAL -> cmp == 0;
        };
    }

    public BigDecimal normalizePriceToKg(BigDecimal price, String unit) {
        if (price == null) return BigDecimal.ZERO;
        if (unit == null || unit.isBlank() || "KG".equalsIgnoreCase(unit.trim())) {
            return price;
        }
        if ("QUINTAL".equalsIgnoreCase(unit.trim()) || "Rs./Quintal".equalsIgnoreCase(unit.trim())) {
            return price.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        }
        if ("TON".equalsIgnoreCase(unit.trim()) || "TONNE".equalsIgnoreCase(unit.trim())) {
            return price.divide(BigDecimal.valueOf(1000), 4, RoundingMode.HALF_UP);
        }
        return price;
    }

    private String normalizeString(String s) {
        return s == null ? "" : s.trim().replaceAll("\\s+", " ");
    }

    private String buildMessage(PriceAlertSubscription sub, String cropName, BigDecimal price, BigDecimal quantity, String location, SourceType sourceType) {
        String locStr = (location != null && !location.isBlank()) ? " in " + location : "";
        String unitStr = (sub.getUnit() != null ? sub.getUnit().toLowerCase() : "kg");

        if (sourceType == SourceType.GOVERNMENT_MARKET_PRICE) {
            // e.g., Tomato price has reached ₹36/kg in Erode. Your target price was ₹35/kg.
            return String.format("%s price has reached ₹%s/%s%s. Your target price was ₹%s/%s.",
                    cropName,
                    price.stripTrailingZeros().toPlainString(),
                    unitStr,
                    locStr,
                    sub.getTargetPrice().stripTrailingZeros().toPlainString(),
                    unitStr);
        } else if (sourceType == SourceType.FARMER_LISTING) {
            String qtyStr = (quantity != null) ? " (Quantity: " + quantity.stripTrailingZeros().toPlainString() + " " + unitStr + ")" : "";
            return String.format("A farmer has listed %s%s at ₹%s/%s%s. Your target price was ₹%s/%s.",
                    cropName, locStr, price.stripTrailingZeros().toPlainString(), unitStr, qtyStr,
                    sub.getTargetPrice().stripTrailingZeros().toPlainString(), unitStr);
        } else {
            String qtyStr = (quantity != null) ? " (Quantity: " + quantity.stripTrailingZeros().toPlainString() + " " + unitStr + ")" : "";
            return String.format("A dealer is offering to buy %s%s at ₹%s/%s%s. Your target price was ₹%s/%s.",
                    cropName, locStr, price.stripTrailingZeros().toPlainString(), unitStr, qtyStr,
                    sub.getTargetPrice().stripTrailingZeros().toPlainString(), unitStr);
        }
    }
}