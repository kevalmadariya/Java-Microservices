package com.trade.loan_microservice.dto;


import lombok.Data;

@Data
public class LoginRequestDto {

    private String email;
    private String password;
}
