package com.cropdeal.priceservice.controller;

import com.cropdeal.priceservice.dto.PriceAlertSubscriptionRequest;
import com.cropdeal.priceservice.dto.PriceAlertSubscriptionResponse;
import com.cropdeal.priceservice.security.JwtService;
import com.cropdeal.priceservice.service.PriceAlertSubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prices/alerts")
@Tag(name = "Price Alert API", description = "Endpoints for managing farmer price alert subscriptions")
public class PriceAlertController {

    private final PriceAlertSubscriptionService subscriptionService;
    private final JwtService jwtService;

    public PriceAlertController(PriceAlertSubscriptionService subscriptionService, JwtService jwtService) {
        this.subscriptionService = subscriptionService;
        this.jwtService = jwtService;
    }

    @PostMapping
    @Operation(summary = "Create a price alert for authenticated FARMER")
    public ResponseEntity<PriceAlertSubscriptionResponse> createAlert(
            @Valid @RequestBody PriceAlertSubscriptionRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {

        Long userId = resolveUserId(authHeader, headerUserId);
        String userRole = resolveUserRole(authHeader, headerUserRole);

        PriceAlertSubscriptionResponse response = subscriptionService.createSubscription(request, userId, userRole);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all price alerts for the authenticated farmer")
    public ResponseEntity<List<PriceAlertSubscriptionResponse>> getFarmerAlerts(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {

        Long userId = resolveUserId(authHeader, headerUserId);
        String userRole = resolveUserRole(authHeader, headerUserRole);

        return ResponseEntity.ok(subscriptionService.getSubscriptions(userId, userRole));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active price alerts for the authenticated farmer")
    public ResponseEntity<List<PriceAlertSubscriptionResponse>> getActiveAlerts(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {

        Long userId = resolveUserId(authHeader, headerUserId);
        String userRole = resolveUserRole(authHeader, headerUserRole);

        return ResponseEntity.ok(subscriptionService.getActiveSubscriptions(userId, userRole));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an individual price alert by ID")
    public ResponseEntity<PriceAlertSubscriptionResponse> getAlertById(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {

        Long userId = resolveUserId(authHeader, headerUserId);
        String userRole = resolveUserRole(authHeader, headerUserRole);

        return ResponseEntity.ok(subscriptionService.getSubscriptionById(id, userId, userRole));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel a price alert")
    public ResponseEntity<PriceAlertSubscriptionResponse> cancelAlert(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {

        Long userId = resolveUserId(authHeader, headerUserId);
        String userRole = resolveUserRole(authHeader, headerUserRole);

        return ResponseEntity.ok(subscriptionService.cancelSubscription(id, userId, userRole));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing price alert")
    public ResponseEntity<PriceAlertSubscriptionResponse> updateAlert(
            @PathVariable Long id,
            @Valid @RequestBody PriceAlertSubscriptionRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {

        Long userId = resolveUserId(authHeader, headerUserId);
        String userRole = resolveUserRole(authHeader, headerUserRole);

        return ResponseEntity.ok(subscriptionService.updateSubscription(id, request, userId, userRole));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete or cancel a price alert")
    public ResponseEntity<Void> deleteAlert(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {

        Long userId = resolveUserId(authHeader, headerUserId);
        String userRole = resolveUserRole(authHeader, headerUserRole);

        subscriptionService.deleteSubscription(id, userId, userRole);
        return ResponseEntity.noContent().build();
    }

    private Long resolveUserId(String authHeader, Long headerUserId) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                Long extracted = jwtService.extractUserId(authHeader.substring(7));
                if (extracted != null) return extracted;
            } catch (Exception ignored) {}
        }
        if (headerUserId != null) return headerUserId;
        return null;
    }

    private String resolveUserRole(String authHeader, String headerUserRole) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String extracted = jwtService.extractRole(authHeader.substring(7));
                if (extracted != null) return extracted;
            } catch (Exception ignored) {}
        }
        if (headerUserRole != null) return headerUserRole;
        return null;
    }
}