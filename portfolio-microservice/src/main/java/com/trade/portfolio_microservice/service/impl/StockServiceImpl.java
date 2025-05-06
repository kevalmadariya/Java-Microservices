package com.trade.portfolio_microservice.service.impl;

import com.trade.portfolio_microservice.model.Stock;
import com.trade.portfolio_microservice.repository.StockRepository;
import com.trade.portfolio_microservice.service.StockService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StockServiceImpl implements StockService {

    @Autowired
    private StockRepository repository;

    @Override
    public List<Stock> getAllStocks() {
        return repository.findAll();
    }

    @Override
    public Optional<Stock> getStockById(String stockId) {
        return repository.findById(stockId);
    }

    @Override
    public Stock saveStock(Stock stock) {
        return repository.save(stock);
    }

    @Override
    public void deleteStock(String stockId) {
        repository.deleteById(stockId);
    }

    @Override
    public Stock updateStock(String stockId, Stock updatedStock) {
        if (repository.existsById(stockId)) {
            updatedStock.setStockId(stockId);
            return repository.save(updatedStock);
        }
        return null;
    }
}
