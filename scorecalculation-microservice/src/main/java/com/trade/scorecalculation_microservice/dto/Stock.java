package com.trade.scorecalculation_microservice.dto;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "stock")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Stock {
    @Id
    private String stockId;
    private String symbol;
    private String name;
    private String exchange;
    private Boolean shortable; 
    private String ticker;
}

