package com.trade.portfolio_microservice.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "user_portfolio")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPortfolio {
    @Id
    private String portfolioId;
    private String userId;
    
    private Double investedAmount = 0.0;
    private Double balance = 10000.0;

    // private Double portfolioValue;
    private double pnl = 0.0;

    private LocalDateTime timestamp;


}