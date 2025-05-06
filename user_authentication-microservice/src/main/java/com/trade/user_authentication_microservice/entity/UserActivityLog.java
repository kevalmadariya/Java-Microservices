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
@Document(collection = "user_activity_log")
public class UserActivityLog {

    @Id
    private String logId;

    @DBRef
    private User user;  // Reference to User model

    private String activityType;  // login / logout / password_reset, etc.
    private Instant timestamp;
    private String ipAddress;
    private String userAgent;
}