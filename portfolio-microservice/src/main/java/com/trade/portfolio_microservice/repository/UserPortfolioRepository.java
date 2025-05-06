package com.trade.portfolio_microservice.repository;

import com.trade.portfolio_microservice.model.UserPortfolio;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserPortfolioRepository extends MongoRepository<UserPortfolio, String> {
    UserPortfolio findByUserId(String userId);
}
