package com.trade.loan_microservice.models;


import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
// 3. UserLoanDetails
@Document(collection = "user_loan_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
    public class UserLoanDetails {
        @Id
        private String id;
        private List<PledgedStockDetails> pledgedStockList;
        private String userId;
        private BigDecimal amtLoanNeeded;
        private LocalDateTime createdAt;
    }
