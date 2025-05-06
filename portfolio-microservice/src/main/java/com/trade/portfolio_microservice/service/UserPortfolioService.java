package com.trade.portfolio_microservice.service;

import com.trade.portfolio_microservice.model.UserPortfolio;

public interface UserPortfolioService {
    UserPortfolio getUserPortfolio(String userId);
    UserPortfolio saveOrUpdatePortfolio(UserPortfolio portfolio);
    void updateBalance(String userId, Double newBalance);
    UserPortfolio getUserPortfolioWithPnL(String userId);
}
