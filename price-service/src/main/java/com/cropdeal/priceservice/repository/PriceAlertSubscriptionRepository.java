package com.cropdeal.priceservice.repository;

import com.cropdeal.priceservice.entity.PriceAlertStatus;
import com.cropdeal.priceservice.entity.PriceAlertSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriceAlertSubscriptionRepository extends JpaRepository<PriceAlertSubscription, Long> {
    List<PriceAlertSubscription> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<PriceAlertSubscription> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, PriceAlertStatus status);
    List<PriceAlertSubscription> findByActiveTrue();
    List<PriceAlertSubscription> findByActiveTrueAndUserRole(String userRole);
    List<PriceAlertSubscription> findByStatus(PriceAlertStatus status);
    List<PriceAlertSubscription> findByStatusAndUserRole(PriceAlertStatus status, String userRole);
}