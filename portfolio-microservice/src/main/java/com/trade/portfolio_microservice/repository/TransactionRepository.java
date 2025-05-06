package com.trade.portfolio_microservice.repository;

import com.trade.portfolio_microservice.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TransactionRepository extends MongoRepository<Transaction, String> {
    List<Transaction> findByUserId(String userId);  // Custom query to find transactions by userId
}
