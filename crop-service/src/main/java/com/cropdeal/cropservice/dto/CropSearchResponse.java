package com.cropdeal.cropservice.dto;

import java.math.BigDecimal;

public record CropSearchResponse(Long id, Long farmerId, String commodity, String state, String district,
                                 String grade, BigDecimal quantity, String unit,
                                 BigDecimal pricePerKg, String status) {}
