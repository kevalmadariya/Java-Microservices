package com.trade.loan_microservice.repository;

import com.trade.loan_microservice.models.*;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PledgedStockDetailsRepository extends MongoRepository<PledgedStockDetails, String> {
    void deleteById(String id);
    boolean existsById(String id);
    List<PledgedStockDetails> findByUserLoanDetailsId(String userId);
}
