package com.trade.user_authentication_microservice.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "kyc_documents")
public class KycDocuments {

    @Id
    private String kycId;

    @DBRef
    private User user;  // Reference to User model

    private String panNumber;
    private String aadhaarNumber;
    private String addressProofType;  // Utility bill, bank statement, etc.
    private String addressProofUrl;
    private String kycStatus;  // pending / verified / rejected
    private Instant submittedAt;
    private Instant verifiedAt;
}