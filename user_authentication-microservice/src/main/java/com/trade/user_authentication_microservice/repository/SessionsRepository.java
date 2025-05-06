package com.trade.user_authentication_microservice.repository;

import com.trade.user_authentication_microservice.entity.Sessions;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface SessionsRepository extends MongoRepository<Sessions, String> {
    List<Sessions> findByUserUserId(String userId);
    Optional<Sessions> findByRefreshToken(String refreshToken);
}