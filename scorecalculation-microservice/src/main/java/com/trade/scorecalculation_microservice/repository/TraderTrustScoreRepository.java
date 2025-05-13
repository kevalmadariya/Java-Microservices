package com.trade.scorecalculation_microservice.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.trade.scorecalculation_microservice.model.TraderTrustScore;

import java.util.List;

@Repository
public interface TraderTrustScoreRepository extends MongoRepository<TraderTrustScore, String> {
    TraderTrustScore findByUserId(String userId);
}

