package com.trade.scorecalculation_microservice.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.trade.scorecalculation_microservice.model.StockTrustScore;

import java.util.List;

@Repository
public interface StockTrustScoreRepository extends MongoRepository<StockTrustScore, String> {
    List<StockTrustScore> findByStockId(String stockId);
    // List<StockTrustScore> findByTradeSignalId(String tradeSignalId);

    List<StockTrustScore> findByUserLoanDetailsId(String userLoanDetailsId);
}
