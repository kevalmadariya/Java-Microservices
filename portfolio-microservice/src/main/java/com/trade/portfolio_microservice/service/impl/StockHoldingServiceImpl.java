package com.trade.portfolio_microservice.service.impl;

import com.trade.portfolio_microservice.model.StockHolding;
import com.trade.portfolio_microservice.repository.StockHoldingRepository;
import com.trade.portfolio_microservice.service.StockHoldingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StockHoldingServiceImpl implements StockHoldingService {

    @Autowired
    private StockHoldingRepository repository;

    @Override
    public List<StockHolding> getAllStockHoldings() {
        return repository.findAll();
    }

    @Override
    public Optional<StockHolding> getStockHoldingById(String holdingId) {
        return repository.findById(holdingId);
    }

    @Override
    public Optional<StockHolding> getStockHoldingByUserIdAndStockId(String userId, String stockId) {
        return repository.findByUserIdAndStockId(userId, stockId);
    }

    @Override
    public List<StockHolding> getStockHoldingsByUserId(String userId) {
        return repository.findByUserId(userId);
    }

    @Override
    public StockHolding saveStockHolding(StockHolding stockHolding) {
        return repository.save(stockHolding);
    }

    @Override
    public void deleteStockHolding(String holdingId) {
        repository.deleteById(holdingId);
    }

    @Override
    public StockHolding updateStockHolding(String holdingId, StockHolding updatedStockHolding) {
        if (repository.existsById(holdingId)) {
            updatedStockHolding.setHoldingId(holdingId);
            return repository.save(updatedStockHolding);
        }
        return null;
    }
}
