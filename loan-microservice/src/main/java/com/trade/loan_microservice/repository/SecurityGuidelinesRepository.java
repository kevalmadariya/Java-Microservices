package com.trade.loan_microservice.repository;

import com.trade.loan_microservice.models.*;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityGuidelinesRepository extends MongoRepository<SecurityGuidelines, String> {
    void deleteById(String id);
    boolean existsById(String id);
    
    List<SecurityGuidelines> findByBank_Id(String bankId);
}
