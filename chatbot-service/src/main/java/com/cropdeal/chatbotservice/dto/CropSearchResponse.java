package com.cropdeal.chatbotservice.dto;

import java.math.BigDecimal;

public record CropSearchResponse(
        Long id,
        Long farmerId,
        String commodity,
        String state,
        String district,
        String grade,
        BigDecimal quantity,
        String unit,
        BigDecimal pricePerKg,
        String status
) {
    public CropSearchResponse(
            Long id,
            String commodity,
            String state,
            String district,
            String grade,
            BigDecimal quantity,
            String unit,
            BigDecimal pricePerKg,
            String status
    ) {
        this(id, null, commodity, state, district, grade, quantity, unit, pricePerKg, status);
    }
}
