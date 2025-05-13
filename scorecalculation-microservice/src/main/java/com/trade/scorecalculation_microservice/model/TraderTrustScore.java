package com.trade.scorecalculation_microservice.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Document(collection = "trader_trust_score")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TraderTrustScore {
    @Id
    private String id;
    private String userId;
    private float score;
    private LocalDate date;
}
