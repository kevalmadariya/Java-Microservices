package com.trade.loan_microservice.dto;


import lombok.Data;

@Data
public class LoginResponseDto {
    private String bankId;
    private String token;
}
