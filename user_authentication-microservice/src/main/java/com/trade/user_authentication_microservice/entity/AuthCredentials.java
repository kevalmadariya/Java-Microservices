package com.trade.user_authentication_microservice.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "auth_credentials")
public class AuthCredentials {

    @Id
    private String authId;

    @DBRef
    private User user;

    private String hashedPassword;
    private String salt;
    private String authProvider;  // local, google, etc.
    private Instant lastLogin;
    private int loginAttempts;
    private boolean isLocked;
    
}