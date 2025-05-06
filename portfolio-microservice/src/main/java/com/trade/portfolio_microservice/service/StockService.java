package com.trade.portfolio_microservice.service;

import com.trade.portfolio_microservice.model.Stock;

import java.util.List;
import java.util.Optional;


public interface StockService {

    List<Stock> getAllStocks();

    Optional<Stock> getStockById(String stockId);

    Stock saveStock(Stock stock);

    void deleteStock(String stockId);

    Stock updateStock(String stockId, Stock updatedStock);
}
