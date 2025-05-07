package com.trade.loan_microservice.repository;

import com.trade.loan_microservice.models.*;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanStatusRepository extends MongoRepository<LoanStatus, String> {
    void deleteById(String id);
    boolean existsById(String id);
    
    List<LoanStatus> findByUserId(String userId);
    List<LoanStatus> findByStatus(String status);
    List<LoanStatus> findByBankId(String bankId);
}
