package com.trade.user_authentication_microservice.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.trade.user_authentication_microservice.entity.AuthCredentials;

import java.util.Optional;

public interface AuthCredentialsRepository extends MongoRepository<AuthCredentials, String> {
    Optional<AuthCredentials> findByUserUserId(String userId);
}