package com.trade.user_authentication_microservice.dto;

import lombok.Data;

@Data
public class SignupRequestDto {

    private String fullName;
    private String email;
    private String password;
}
