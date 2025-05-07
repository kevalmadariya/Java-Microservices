package com.trade.user_authentication_microservice.dto;

import lombok.Data;

@Data
public class LoginResponseDto {
    private String userId;
    private String token;
}
