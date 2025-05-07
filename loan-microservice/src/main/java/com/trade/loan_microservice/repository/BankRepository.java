package com.trade.loan_microservice.repository;

import com.trade.loan_microservice.models.*;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BankRepository extends MongoRepository<Bank, String> {
    void deleteById(String id);
    boolean existsById(String id);
    Optional<Bank> findByEmail(String email);
}
