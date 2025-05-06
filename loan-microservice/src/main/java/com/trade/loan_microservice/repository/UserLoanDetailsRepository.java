package com.trade.loan_microservice.repository;
import com.trade.loan_microservice.models.*;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface UserLoanDetailsRepository extends MongoRepository<UserLoanDetails, String> {
    List<UserLoanDetails> findByUserId(String userId);
}
