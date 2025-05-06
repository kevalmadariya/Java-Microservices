package com.trade.portfolio_microservice.controller;

import com.trade.portfolio_microservice.model.UserPortfolio;
import com.trade.portfolio_microservice.service.UserPortfolioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(origins = "*")
public class UserPortfolioController {

    @Autowired
    private UserPortfolioService portfolioService;

    @GetMapping("/{userId}")
    public UserPortfolio getPortfolio(@PathVariable String userId) {
        return portfolioService.getUserPortfolioWithPnL(userId);
    }

    @PostMapping("/")
    public UserPortfolio createOrUpdate(@RequestBody UserPortfolio portfolio) {
        return portfolioService.saveOrUpdatePortfolio(portfolio);
    }

    @PutMapping("/{userId}/balance")
    public void updateBalance(@PathVariable String userId, @RequestParam Double balance) {
        portfolioService.updateBalance(userId, balance);
    }   
}
