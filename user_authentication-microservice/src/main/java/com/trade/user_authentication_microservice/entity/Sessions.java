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
@Document(collection = "sessions")
public class Sessions {

    @Id
    private String sessionId;

    @DBRef
    private User user;  // Reference to User model

    private String refreshToken;
    private Instant createdAt;
    private Instant expiresAt;
    private String deviceInfo;
}