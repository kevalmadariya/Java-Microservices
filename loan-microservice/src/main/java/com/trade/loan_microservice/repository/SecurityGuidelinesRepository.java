package com.trade.loan_microservice.repository;

import com.trade.loan_microservice.models.*;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SecurityGuidelinesRepository extends MongoRepository<SecurityGuidelines, String> {
    void deleteById(String id);
    boolean existsById(String id);
    
    Optional<SecurityGuidelines> findByBankId(String bankId);  // Changed to return Optional
}
