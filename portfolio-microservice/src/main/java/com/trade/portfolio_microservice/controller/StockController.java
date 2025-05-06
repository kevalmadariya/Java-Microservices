package com.trade.portfolio_microservice.controller;

import com.trade.portfolio_microservice.model.Stock;
import com.trade.portfolio_microservice.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/stocks")
public class StockController {

    @Autowired
    private StockService stockService;

    // Get all stocks
    @GetMapping
    public List<Stock> getAllStocks() {
        return stockService.getAllStocks();
    }

    // Get stock by ID
    @GetMapping("/{stockId}")
    public ResponseEntity<Stock> getStockById(@PathVariable String stockId) {
        Optional<Stock> stock = stockService.getStockById(stockId);
        return stock.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Save a new stock
    @PostMapping
    public ResponseEntity<Stock> saveStock(@RequestBody Stock stock) {
        Stock savedStock = stockService.saveStock(stock);
        return new ResponseEntity<>(savedStock, HttpStatus.CREATED);
    }

    // Delete stock by ID
    @DeleteMapping("/{stockId}")
    public ResponseEntity<Void> deleteStock(@PathVariable String stockId) {
        stockService.deleteStock(stockId);
        return ResponseEntity.noContent().build();
    }

    // Update an existing stock
    @PutMapping("/{stockId}")
    public ResponseEntity<Stock> updateStock(@PathVariable String stockId, @RequestBody Stock updatedStock) {
        Stock updated = stockService.updateStock(stockId, updatedStock);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }
}
