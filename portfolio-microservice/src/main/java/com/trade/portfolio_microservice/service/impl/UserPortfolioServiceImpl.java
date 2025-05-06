package com.trade.portfolio_microservice.service.impl;

import com.trade.portfolio_microservice.StockPriceService;
import com.trade.portfolio_microservice.model.StockHolding;
import com.trade.portfolio_microservice.model.UserPortfolio;
import com.trade.portfolio_microservice.repository.StockHoldingRepository;
import com.trade.portfolio_microservice.repository.UserPortfolioRepository;
import com.trade.portfolio_microservice.service.UserPortfolioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserPortfolioServiceImpl implements UserPortfolioService {

    @Autowired
    private StockHoldingRepository holdingRepo;

    @Autowired
    private UserPortfolioRepository portfolioRepository;

    @Autowired
    private StockPriceService priceService;

    @Override
    public UserPortfolio getUserPortfolio(String userId) {
        return portfolioRepository.findByUserId(userId);
    }

    public UserPortfolio getUserPortfolioWithPnL(String userId) {
        UserPortfolio portfolio = portfolioRepository.findByUserId(userId);
        List<StockHolding> holdings = holdingRepo.findByUserId(userId);

        double totalCurrentValue = 0;
        double totalInvestment = 0;

        for (StockHolding holding : holdings) {
            double currentPrice = priceService.getLatestPrice(holding.getStockId()); // uses Python service
            double currentValue = holding.getNumberOfShares() * currentPrice;

            totalCurrentValue += currentValue;
            totalInvestment += holding.getInvestmentAmount();

            double holdingPnL = currentValue - holding.getInvestmentAmount();
            holding.setPnl(holdingPnL); // transient
        }

        double portfolioPnL = totalCurrentValue - totalInvestment;
        portfolio.setPnl(portfolioPnL);

        return portfolio;
    }

    @Override
    public UserPortfolio saveOrUpdatePortfolio(UserPortfolio portfolio) {
        portfolio.setTimestamp(LocalDateTime.now());
        return portfolioRepository.save(portfolio);
    }

    @Override
    public void updateBalance(String userId, Double newBalance) {
        UserPortfolio portfolio = getUserPortfolio(userId);
        portfolio.setBalance(newBalance);
        portfolio.setTimestamp(LocalDateTime.now());
        portfolioRepository.save(portfolio);
    }
}
