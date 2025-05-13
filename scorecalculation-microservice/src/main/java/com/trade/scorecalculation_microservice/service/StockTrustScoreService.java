package com.trade.scorecalculation_microservice.service;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.trade.scorecalculation_microservice.model.StockTrustScore;
import com.trade.scorecalculation_microservice.repository.StockTrustScoreRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockTrustScoreService {
    private final StockTrustScoreRepository stockTrustScoreRepository;

    public List<StockTrustScore> getStockScoresByStockId(String stockId) {
        return stockTrustScoreRepository.findByStockId(stockId);
    }

    // public List<StockTrustScore> getStockScoresByTradeSignalId(String tradeSignalId) {
    //     return stockTrustScoreRepository.findByTradeSignalId(tradeSignalId);
    // }
}
