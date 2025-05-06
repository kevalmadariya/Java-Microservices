package com.trade.user_authentication_microservice.repository;

import com.trade.user_authentication_microservice.entity.KycDocuments;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface KycDocumentsRepository extends MongoRepository<KycDocuments, String> {
    Optional<KycDocuments> findByUserUserId(String userId);
}