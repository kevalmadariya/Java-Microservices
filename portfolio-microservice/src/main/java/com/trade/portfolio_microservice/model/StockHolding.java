package com.trade.portfolio_microservice.model;

import org.springframework.data.annotation.Transient; // Correct import
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "stock_holding")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockHolding {
    @Id
    private String holdingId;
    private String userId;
    private String stockId;
    private Double numberOfShares;
    private Double investmentAmount;
    private Double averageBuyPrice;
    private LocalDateTime lastUpdated;

    @Transient
    private double pnl;


}

