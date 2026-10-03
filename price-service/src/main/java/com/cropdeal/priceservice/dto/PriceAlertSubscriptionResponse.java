package com.cropdeal.priceservice.dto;

import com.cropdeal.priceservice.entity.PriceAlertStatus;
import com.cropdeal.priceservice.entity.PriceCondition;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PriceAlertSubscriptionResponse {
    private Long id;
    private Long userId;
    private String userRole;
    private String cropName;
    private BigDecimal targetPrice;
    private PriceCondition priceCondition;
    private String mandi;
    private String district;
    private String state;
    private String unit;
    private PriceAlertStatus status;
    private Boolean active;
    private LocalDateTime triggeredAt;
    private LocalDateTime lastNotifiedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }

    public String getCropName() { return cropName; }
    public void setCropName(String cropName) { this.cropName = cropName; }

    public BigDecimal getTargetPrice() { return targetPrice; }
    public void setTargetPrice(BigDecimal targetPrice) { this.targetPrice = targetPrice; }

    public PriceCondition getPriceCondition() { return priceCondition; }
    public void setPriceCondition(PriceCondition priceCondition) { this.priceCondition = priceCondition; }

    public String getMandi() {
        return (mandi != null && !mandi.isBlank()) ? mandi : district;
    }
    public void setMandi(String mandi) {
        this.mandi = mandi;
        if (this.district == null || this.district.isBlank()) {
            this.district = mandi;
        }
    }

    public String getDistrict() { return district; }
    public void setDistrict(String district) {
        this.district = district;
        if (this.mandi == null || this.mandi.isBlank()) {
            this.mandi = district;
        }
    }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public PriceAlertStatus getStatus() { return status; }
    public void setStatus(PriceAlertStatus status) { this.status = status; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public LocalDateTime getTriggeredAt() { return triggeredAt; }
    public void setTriggeredAt(LocalDateTime triggeredAt) { this.triggeredAt = triggeredAt; }

    public LocalDateTime getLastNotifiedAt() { return lastNotifiedAt; }
    public void setLastNotifiedAt(LocalDateTime lastNotifiedAt) { this.lastNotifiedAt = lastNotifiedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}