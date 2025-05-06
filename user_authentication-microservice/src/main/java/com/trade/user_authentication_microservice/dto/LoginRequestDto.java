package com.trade.user_authentication_microservice.dto;

import lombok.Data;

@Data
public class LoginRequestDto {

    private String email;
    private String password;
}
