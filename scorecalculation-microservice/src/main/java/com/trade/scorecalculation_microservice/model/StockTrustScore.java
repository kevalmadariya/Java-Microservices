package com.trade.scorecalculation_microservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Document(collection = "stock_trust_score")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockTrustScore {
    @Id
    private String id;
    private String stockId;
    private String userLoanDetailsId;
    // private float score;
    private LocalDate date;
    private String symbol;
    //short-term-pridictio
    private String tradeSignalID;
    private float predictedPrice;
    private boolean is_fundamently_strong;
    private String cluster_recommendation;
    private String indicator_recommendation;
    private String indicator_used;
    private String recommendation;

    //long-term-prediction
    private String current_price;
    private String arima_forcast;
    private String train_accuracy;
    private String test_accuracy;
    private String is_long_term;
    private String tradeSignal;
    private LocalDateTime last_updated;
}