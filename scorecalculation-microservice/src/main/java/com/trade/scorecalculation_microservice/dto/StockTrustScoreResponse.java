package com.trade.scorecalculation_microservice.dto;

import java.time.LocalDate;

import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "stock_holding")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockTrustScoreResponse {
    private String stockId;
    // // private float score;
    private LocalDate date;
    //short-term-pridictio
    private String tradeSignalID;
    private float predictedPrice;
    private boolean Is_fundamently_strong;
    private String cluster_recommendation;
    private String indicator_recommendation;
    private String indicator_used;
    private String final_recommendation;

    // //long-term-prediction
    private String current_price;
    private String arima_forcast;
    private String train_accuracy;
    private String test_accuracy;
    private String is_long_term;
    private String technical_signals;
    private String recommendation;
}