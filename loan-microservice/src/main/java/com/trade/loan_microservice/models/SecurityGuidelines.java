package com.trade.loan_microservice.models;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;


// 2. SecurityGuidelines
@Document(collection = "security_guidelines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityGuidelines {
    @Id
    private String id;

    @DBRef
    private Bank bank;

    private BigDecimal LTV;
    private BigDecimal minimumLoan;
    private BigDecimal maximumLoan;
    private String capType; // ENUM: "large", "mid", "small"
    private String interestRateRange;
    private int tenure; // in months
}
