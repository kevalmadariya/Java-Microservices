package com.trade.loan_microservice.models;

import org.springframework.data.annotation.Id;
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
public class PledgedStockDetails {
    @Id
    private String id;
    private String stockId;

    private String userLoanDetailsId;  // <== Make sure this exists and matches the repository method name

    private int quantity;
}
