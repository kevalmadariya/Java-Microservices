package com.trade.user_authentication_microservice.config;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@Configuration
@EnableMongoAuditing
public class MongoConfig {
    // You can optionally define an AuditorAware bean here
    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }
}
