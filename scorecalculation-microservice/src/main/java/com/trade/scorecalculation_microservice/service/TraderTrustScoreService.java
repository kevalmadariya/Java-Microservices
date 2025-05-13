package com.trade.scorecalculation_microservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.trade.scorecalculation_microservice.model.TraderTrustScore;
import com.trade.scorecalculation_microservice.repository.TraderTrustScoreRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TraderTrustScoreService {
    private final TraderTrustScoreRepository traderTrustScoreRepository;

    public TraderTrustScore getTraderScoresByUserId(String userId) {
        return traderTrustScoreRepository.findByUserId(userId);
    }
}

