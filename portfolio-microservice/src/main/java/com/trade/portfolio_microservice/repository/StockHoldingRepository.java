package com.trade.portfolio_microservice.repository;

import com.trade.portfolio_microservice.model.StockHolding;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface StockHoldingRepository extends MongoRepository<StockHolding, String> {
    List<StockHolding> findByUserId(String userId);  // Custom query for filtering by userId
    List<StockHolding> findByStockId(int stockId);
    List<StockHolding> findByUserIdAndStockId(int userId, int stockId);

    Optional<StockHolding> findByUserIdAndStockId(String userId, String stockId);

}
