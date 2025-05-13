package com.trade.scorecalculation_microservice.dto;


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
public class FundamentalsResult {
    private String ticker;
    private Float current_price;
    private Float pe_ratio;
    private Float pb_ratio;
    private Float debt_to_equity;
    private Float eps;
    private Float roe;
    private int met_conditions;
    private String signal;
    private Map<String, Boolean> conditions;
    private boolean is_fundamentally_strong;
}
