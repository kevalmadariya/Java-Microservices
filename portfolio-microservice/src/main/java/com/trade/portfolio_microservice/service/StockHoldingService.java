package com.trade.portfolio_microservice.service;

import com.trade.portfolio_microservice.model.StockHolding;

import java.util.List;
import java.util.Optional;

public interface StockHoldingService {

    List<StockHolding> getAllStockHoldings();

    Optional<StockHolding> getStockHoldingById(String holdingId);

    List<StockHolding> getStockHoldingsByUserId(String userId);

    StockHolding saveStockHolding(StockHolding stockHolding);

    void deleteStockHolding(String holdingId);

    StockHolding updateStockHolding(String holdingId, StockHolding updatedStockHolding);

    Optional<StockHolding> getStockHoldingByUserIdAndStockId(String userId, String stockId);

}
