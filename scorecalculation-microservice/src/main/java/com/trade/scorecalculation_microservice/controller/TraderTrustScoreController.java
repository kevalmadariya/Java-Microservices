package com.trade.scorecalculation_microservice.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.trade.scorecalculation_microservice.dto.Transaction;
import com.trade.scorecalculation_microservice.feign.PortfolioClient;
import com.trade.scorecalculation_microservice.model.TraderTrustScore;
import com.trade.scorecalculation_microservice.repository.TraderTrustScoreRepository;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trader-trust")
@RequiredArgsConstructor
public class TraderTrustScoreController {
    private final TraderTrustScoreRepository repository;

    @Autowired
    PortfolioClient portfoilioClient;

    @PostMapping("/{userid}")
    public TraderTrustScore create(@PathVariable String userid) {
        try {
            // Step 1: Get userId from userLoanDetailsId
            String userId = userid;

            // Step 2: Fetch transactions for the user
            List<Transaction> transactions = portfoilioClient.getTransactionsByUserId(userId);
            Map<String, List<Transaction>> stockGrouped = transactions.stream()
                    .collect(Collectors.groupingBy(Transaction::getSymbol));

            float trustScore = 50.0f;

            // Step 3: Score based on buy/sell comparisons
            for (Map.Entry<String, List<Transaction>> entry : stockGrouped.entrySet()) {
                List<Transaction> stockTxns = entry.getValue();

                Optional<Transaction> firstBuy = stockTxns.stream()
                        .filter(t -> "BUY".equalsIgnoreCase(t.getTransactionType()))
                        .sorted(Comparator.comparing(Transaction::getTimestamp))
                        .findFirst();

                Optional<Transaction> firstSell = stockTxns.stream()
                        .filter(t -> "SELL".equalsIgnoreCase(t.getTransactionType()))
                        .sorted(Comparator.comparing(Transaction::getTimestamp))
                        .findFirst();

                if (firstBuy.isPresent() && firstSell.isPresent()) {
                    double buyPrice = firstBuy.get().getPrice();
                    double sellPrice = firstSell.get().getPrice();
                    if (sellPrice > buyPrice) {
                        trustScore += 5.0;
                    } else if (sellPrice < buyPrice) {
                        trustScore -= 3.0;
                    }
                }
            }

            // Clamp trustScore between 0 and 100
            trustScore = Math.min(100, Math.max(0, trustScore));

            // Step 4: Create TraderTrustScore object
            TraderTrustScore score = new TraderTrustScore();
            score.setUserId(userId);
            score.setScore(trustScore);
            score.setDate(LocalDate.now());

            return repository.save(score);

        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate trader trust score: " + e.getMessage(), e);
        }
    }

    @GetMapping
    public List<TraderTrustScore> getAll() {
        return repository.findAll();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<TraderTrustScore> getByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(repository.findByUserId(userId));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        repository.deleteById(id);
    }
}
