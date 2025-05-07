package com.trade.portfolio_microservice.controller;

import com.trade.portfolio_microservice.model.StockHolding;
import com.trade.portfolio_microservice.model.Transaction;
import com.trade.portfolio_microservice.model.UserPortfolio;
import com.trade.portfolio_microservice.service.StockHoldingService;
import com.trade.portfolio_microservice.service.TransactionService;
import com.trade.portfolio_microservice.service.UserPortfolioService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;


    @Autowired
    private UserPortfolioService userPortfolioService;

    @Autowired
    private StockHoldingService stockHoldingService;

    // Get all transactions
    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionService.getAllTransactions();
    }

    // Get transaction by ID
    @GetMapping("/{transactionId}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable String transactionId) {
        Optional<Transaction> transaction = transactionService.getTransactionById(transactionId);
        return transaction.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get transactions by user ID
    @GetMapping("/user/{userId}")
    public List<Transaction> getTransactionsByUserId(@PathVariable String userId) {
        return transactionService.getTransactionsByUserId(userId);
    }



    @PostMapping
    public ResponseEntity<?> saveTransaction(@RequestBody Transaction transaction) {
        transaction.setTimestamp(LocalDateTime.now());
    
        String userId = transaction.getUserId();
        String stockId = transaction.getSymbol();
        double shares = transaction.getShares();
        double pricePerShare = transaction.getPrice();
        double totalAmount = transaction.getTotalValue();
    
        // --- Fetch Portfolio ---
        UserPortfolio portfolio = userPortfolioService.getUserPortfolio(userId);
        if (portfolio == null) {
            portfolio = new UserPortfolio();
            portfolio.setUserId(userId);
        }
    
        // --- Fetch Holding ---
        Optional<StockHolding> optionalHolding = stockHoldingService.getStockHoldingByUserIdAndStockId(userId, stockId);
        StockHolding holding = optionalHolding.orElse(null);
    
        // --- Validation for BUY ---
        if (transaction.getTransactionType().equalsIgnoreCase("buy")) {
            if (portfolio.getBalance() < totalAmount) {
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Insufficient balance to complete the buy transaction.");
            }
    
        // --- Validation for SELL ---
        } else if (transaction.getTransactionType().equalsIgnoreCase("sell")) {
            if (holding == null) {
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Cannot sell stock not owned.");
            }
            if (holding.getNumberOfShares() < shares) {
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Not enough shares to sell. Available: " + holding.getNumberOfShares());
            }
        } else {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("Invalid transaction type. Must be 'buy' or 'sell'.");
        }
    
        // --- Save Transaction ---
        Transaction savedTransaction = transactionService.saveTransaction(transaction);
    
        // --- Update Portfolio ---
        if (transaction.getTransactionType().equalsIgnoreCase("buy")) {
            portfolio.setBalance(portfolio.getBalance() - totalAmount);
            portfolio.setInvestedAmount(portfolio.getInvestedAmount() + totalAmount);
        } else {
            portfolio.setBalance(portfolio.getBalance() + totalAmount);
            portfolio.setInvestedAmount(portfolio.getInvestedAmount() - totalAmount);
        }
        portfolio.setTimestamp(LocalDateTime.now());
        userPortfolioService.saveOrUpdatePortfolio(portfolio);
    
        // --- Update or Create Stock Holding ---
        if (holding != null) {
            if (transaction.getTransactionType().equalsIgnoreCase("buy")) {
                double newTotalShares = holding.getNumberOfShares() + shares;
                double newInvestment = holding.getInvestmentAmount() + totalAmount;
                double avgBuyPrice = newInvestment / newTotalShares;
    
                holding.setNumberOfShares(newTotalShares);
                holding.setInvestmentAmount(newInvestment);
                holding.setAverageBuyPrice(avgBuyPrice);
    
            } else {
                double remainingShares = holding.getNumberOfShares() - shares;
                double remainingInvestment = holding.getInvestmentAmount() - (shares * holding.getAverageBuyPrice());
    
                if (remainingShares <= 0) {
                    stockHoldingService.deleteStockHolding(holding.getHoldingId());
                    return new ResponseEntity<>(savedTransaction, HttpStatus.CREATED);
                } else {
                    holding.setNumberOfShares(remainingShares);
                    holding.setInvestmentAmount(remainingInvestment);
                }
            }
        } else {
            holding = new StockHolding();
            holding.setUserId(userId);
            holding.setStockId(stockId);
            holding.setNumberOfShares(shares);
            holding.setInvestmentAmount(totalAmount);
            holding.setAverageBuyPrice(pricePerShare);
        }
    
        holding.setLastUpdated(LocalDateTime.now());
        stockHoldingService.saveStockHolding(holding);
    
        return new ResponseEntity<>(savedTransaction, HttpStatus.CREATED);
    }
    
    // Delete transaction by ID
    @DeleteMapping("/{transactionId}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable String transactionId) {
        transactionService.deleteTransaction(transactionId);
        return ResponseEntity.noContent().build();
    }

    // Update an existing transaction
    @PutMapping("/{transactionId}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable String transactionId, @RequestBody Transaction updatedTransaction) {
        Transaction updated = transactionService.updateTransaction(transactionId, updatedTransaction);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }
}
