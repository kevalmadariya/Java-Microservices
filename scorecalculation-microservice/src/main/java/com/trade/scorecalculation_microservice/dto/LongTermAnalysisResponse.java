package com.trade.scorecalculation_microservice.dto;

import java.util.List;
import java.util.Map;

import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "pledged_stock_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LongTermAnalysisResponse {
    private double current_price;
    private double arima_forecast;
    private double train_accuracy;
    private double test_accuracy;
    private List<String> technical_signals;
    private String recommendation;
    private String last_updated;
}
