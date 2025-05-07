package com.trade.portfolio_microservice.controller;

import com.trade.portfolio_microservice.model.StockHolding;
import com.trade.portfolio_microservice.service.StockHoldingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/stock-holdings")
public class StockHoldingController {

    @Autowired
    private StockHoldingService stockHoldingService;

    // Get all stock holdings
    @GetMapping
    public List<StockHolding> getAllStockHoldings() {
        return stockHoldingService.getAllStockHoldings();
    }

    // Get stock holding by ID
    @GetMapping("/{holdingId}")
    public ResponseEntity<StockHolding> getStockHoldingById(@PathVariable String holdingId) {
        Optional<StockHolding> stockHolding = stockHoldingService.getStockHoldingById(holdingId);
        return stockHolding.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get stock holdings by user ID
    @GetMapping("/user/{userId}")
    public List<StockHolding> getStockHoldingsByUserId(@PathVariable String userId) {
        return stockHoldingService.getStockHoldingsByUserId(userId);
    }

    // Save a new stock holding
    @PostMapping
    public ResponseEntity<StockHolding> saveStockHolding(@RequestBody StockHolding stockHolding) {
        StockHolding savedStockHolding = stockHoldingService.saveStockHolding(stockHolding);
        return new ResponseEntity<>(savedStockHolding, HttpStatus.CREATED);
    }

    // Delete stock holding by ID
    @DeleteMapping("/{holdingId}")
    public ResponseEntity<Void> deleteStockHolding(@PathVariable String holdingId) {
        stockHoldingService.deleteStockHolding(holdingId);
        return ResponseEntity.noContent().build();
    }

    // Update an existing stock holding
    @PutMapping("/{holdingId}")
    public ResponseEntity<StockHolding> updateStockHolding(@PathVariable String holdingId, @RequestBody StockHolding updatedStockHolding) {
        StockHolding updated = stockHoldingService.updateStockHolding(holdingId, updatedStockHolding);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }
}
