package com.trade.user_authentication_microservice.dto;

import lombok.Data;

@Data
public class UserDto {

    private String userid;
    private String fullname;
    private String email;
    private String phoneNumber;

    private String dob;
    private String gender;
    
}
