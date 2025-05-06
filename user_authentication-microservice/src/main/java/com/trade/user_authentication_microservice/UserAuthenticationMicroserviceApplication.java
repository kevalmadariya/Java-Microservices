package com.trade.user_authentication_microservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class UserAuthenticationMicroserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(UserAuthenticationMicroserviceApplication.class, args);
	}

}
