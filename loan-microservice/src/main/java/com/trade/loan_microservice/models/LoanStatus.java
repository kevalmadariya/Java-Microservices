package com.trade.loan_microservice.models;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

// 4. LoanStatus
@Document(collection = "loan_status")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanStatus {
    @Id
    private String id;

    private String userId;
    private String stockTrustScoreId;
    private String traderTrustScoreId;
    private BigDecimal finalScore;
    private String status; // ENUM: "pending", "approved", "rejected", etc.
    private BigDecimal interestRate; // finaly decided by bank
    
    private String bankId;
    private String userLoanDetailsId;

    private LocalDateTime updatedAt;
}
