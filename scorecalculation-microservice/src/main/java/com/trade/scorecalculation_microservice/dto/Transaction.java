package com.trade.scorecalculation_microservice.dto;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "transaction")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    private String transactionId;
    private String userId;
    
    private String symbol;
    // Enum: BUY / SELL
    private String transactionType;

    private Double shares;
    private Double price;
    private Double totalValue;

    // private Double portfolioValue;
    // private Double pnlRealized;

    private LocalDateTime timestamp;
}
