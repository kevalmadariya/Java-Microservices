package com.trade.portfolio_microservice.repository;

import com.trade.portfolio_microservice.model.Stock;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;


public interface StockRepository extends MongoRepository<Stock, String> {
    Optional<Stock> findBySymbol(String symbol);
    // Custom queries can be added here if needed, e.g., find by symbol
}
