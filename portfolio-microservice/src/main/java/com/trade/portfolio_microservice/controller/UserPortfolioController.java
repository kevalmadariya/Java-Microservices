package com.trade.portfolio_microservice.controller;

import com.trade.portfolio_microservice.model.UserPortfolio;
import com.trade.portfolio_microservice.service.UserPortfolioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/portfolio")
public class UserPortfolioController {

    @Autowired
    private UserPortfolioService portfolioService;

    @GetMapping("/{userId}")
    public UserPortfolio getPortfolio(@PathVariable String userId) {
        return portfolioService.getUserPortfolioWithPnL(userId);
    }

    @PostMapping("/{userId}")
    public UserPortfolio createOrUpdate(@PathVariable String userId,@RequestBody UserPortfolio portfolio) {
        portfolio.setUserId(userId);
        System.out.println(portfolio.getUserId());
        System.out.println(-1);
        System.out.println(-1);
        System.out.println(-1);
        System.out.println(-1);
        System.out.println(-1);
        System.out.println(-1);
        System.out.println(-1);
        System.out.println(-1);
        System.out.println(-1);
        System.out.println(-1);
        System.out.println(-1);
        System.out.println(-1);
        System.out.println(-1);
        System.out.println(-1);
        System.out.println(-1);
        System.out.println(-1);
        System.out.println(-1);
        return portfolioService.saveOrUpdatePortfolio(portfolio);
    }

    @PutMapping("/{userId}/balance")
    public void updateBalance(@PathVariable String userId, @RequestParam Double balance) {
        portfolioService.updateBalance(userId, balance);
    }   
}
