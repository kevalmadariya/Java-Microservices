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
public class FundamentalsResponse {
    private List<FundamentalsResult> results;
    
    public List<FundamentalsResult> getResults() { return results; }
    public void setResults(List<FundamentalsResult> results) { this.results = results; }
}
