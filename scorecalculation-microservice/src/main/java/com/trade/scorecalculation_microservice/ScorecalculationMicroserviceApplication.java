package com.trade.scorecalculation_microservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ScorecalculationMicroserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ScorecalculationMicroserviceApplication.class, args);
	}

}
