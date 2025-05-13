package com.trade.scorecalculation_microservice.controller;

import com.trade.scorecalculation_microservice.feign.PledgeStockClient;
import com.trade.scorecalculation_microservice.feign.PortfolioClient;
import com.trade.scorecalculation_microservice.feign.StockClient;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trade.scorecalculation_microservice.dto.*;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import com.trade.scorecalculation_microservice.model.StockTrustScore;
import com.trade.scorecalculation_microservice.repository.StockTrustScoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/stock-trust")
@RequiredArgsConstructor
public class StockTrustScoreController {
    private final StockTrustScoreRepository repository;
    @Autowired
    PortfolioClient portfoilioClient;
    @Autowired
    PledgeStockClient pledgeStockClient;
    @Autowired
    StockClient stockClient;

    @PostMapping
    public StockTrustScore create(@RequestBody StockTrustScore score) {
        System.out.println("addddddddddddddddddddddddddddddddddddddddddddd");
        return repository.save(score);
    }

    @GetMapping
    public List<StockTrustScore> getAll() {
        return repository.findAll();
    }

    @GetMapping("/stock/{stockId}")
    public ResponseEntity<List<StockTrustScore>> getByStockId(@PathVariable String stockId) {
        return ResponseEntity.ok(repository.findByStockId(stockId));
    }

    @GetMapping("/score/{userLoanDetailsId}")
    public ResponseEntity<List<StockTrustScore>> getByUserLoanDetailsId(@PathVariable String userLoanDetailsId) {
        return ResponseEntity.ok(repository.findByUserLoanDetailsId(userLoanDetailsId));
    }

    // @GetMapping("/signal/{tradeSignalId}")
    // public List<StockTrustScore> getByTradeSignalId(@PathVariable String
    // tradeSignalId) {
    // return repository.findByTradeSignalId(tradeSignalId);
    // }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        repository.deleteById(id);
    }

    @GetMapping("/testStockPredictionCall")
    public ResponseEntity<?> testStockPredictionCall() {
        // Step 1: Hardcoded stock symbols (test data)
        List<String> stockSymbols = Arrays.asList("RELIANCE.NS", "TCS.NS", "HDFCBANK.NS");

        // Step 2: Setup HTTP request
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<List<String>> requestEntity = new HttpEntity<>(stockSymbols, headers);

        // Step 3: Call Python FastAPI
        try {
            ResponseEntity<StockTrustScoreResponse[]> response = restTemplate.exchange(
                    "http://127.0.0.1:8001/short_term_analysis",
                    HttpMethod.POST,
                    requestEntity,
                    StockTrustScoreResponse[].class);

            if (response.getStatusCode() == HttpStatus.OK) {
                return ResponseEntity.ok(response.getBody());
            } else {
                return ResponseEntity.status(response.getStatusCode())
                        .body("Error calling prediction service");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Exception occurred: " + e.getMessage());
        }
    }

    @PostMapping("/calculateStockTrustScore/{userloandetailsId}")
    public ResponseEntity<?> calculateStockTrustScore(@PathVariable String userloandetailsId) {
        try {
            // Step 1: Get pledged stocks
            ResponseEntity<List<PledgedStockDetails>> plist = pledgeStockClient
                    .getPledgedStockByUserId(userloandetailsId);
            List<PledgedStockDetails> pledgedList = plist.getBody();
            System.out.println(pledgedList.size());
            if (pledgedList == null || pledgedList.isEmpty()) {
                return ResponseEntity.badRequest().body("No pledged stocks found for user.");
            }

            // Step 2: Fetch ticker symbols and map stockId to ticker
            List<String> tickerList = new ArrayList<>();

            Map<String, String> stockIdToTickerMap = new HashMap<>();
            System.out.println(tickerList.size());
            for (PledgedStockDetails pledged : pledgedList) {
                String stockId = pledged.getStockId();
                tickerList.add(stockId);
                ResponseEntity<Stock> response = stockClient.getStockById(stockId);

                if (response != null && response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    String ticker = response.getBody().getTicker();
                    if (ticker != null) {
                        // tickerList.add(ticker);
                        stockIdToTickerMap.put(stockId, ticker);
                    }
                }
            }

            if (tickerList.isEmpty()) {
                return ResponseEntity.badRequest().body("No valid tickers found for pledged stocks.");
            }

            System.out.println("fundamental analysis start");
            // Step 3: Get analysis data (fundamentals, long-term, short-term)
            ResponseEntity<Map<String, String>> fundamentalsResponse = checkFundamentals(tickerList, 30.0);
            Map<String, String> fundamentalsMap = fundamentalsResponse.getBody();

            System.out.println("long analysis start");

            ResponseEntity<Map<String, Object>> longTermResponse = getLongTermAnalysis(tickerList);
            Map<String, Object> longTermMap = longTermResponse.getBody();

            System.out.println("short analysis start");
            System.out.println(-2);

            ResponseEntity<List<Map<String, Object>>> shortTermResponse = getShortTermAnalysis(tickerList);
            List<Map<String, Object>> shortTermList = shortTermResponse.getBody();

            // Step 4: Calculate scores for each stock
            List<StockTrustScore> scores = new ArrayList<>();
            System.out.println("fundamental analysis start finish");

            for (PledgedStockDetails pledged : pledgedList) {
                System.out.println(-3);
                String stockId = pledged.getStockId();
                // String ticker = stockIdToTickerMap.get(stockId);
                if (stockId == null)
                    continue;
                System.out.println(stockId);
                StockTrustScore score = new StockTrustScore();
                score.setId(UUID.randomUUID().toString());
                score.setStockId(stockId);
                score.setDate(LocalDate.now());
                score.setSymbol(stockId);

                // Set fundamental analysis data
                if (fundamentalsMap != null && fundamentalsMap.containsKey(stockId)) {
                    if ("Yes".equalsIgnoreCase(fundamentalsMap.get(stockId))) {
                        score.set_fundamently_strong(true);
                    } else {
                        score.set_fundamently_strong(false);
                    }
                }

                System.out.println(-4);
                // Set long-term analysis data
                if (longTermMap != null && longTermMap.containsKey(stockId)) {
                    Map<String, Object> longTermData = (Map<String, Object>) longTermMap.get(stockId);
                    score.setCurrent_price(String.valueOf(longTermData.get("current_price")));
                    score.setArima_forcast(String.valueOf(longTermData.get("arima_forecast")));
                    score.setTrain_accuracy(String.valueOf(longTermData.get("train_accuracy")));
                    score.setTest_accuracy(String.valueOf(longTermData.get("test_accuracy")));
                    score.setIs_long_term(String.valueOf(longTermData.get("recommendation")));
                    score.setTradeSignal(String.valueOf(longTermData.get("technical_signals")));
                }

                // Set short-term analysis data
                if (shortTermList != null) {
                    for (Map<String, Object> shortTermData : shortTermList) {
                        System.out.println(-5);
                        if (stockId.equals(shortTermData.get("symbol"))) {
                            score.setTradeSignalID(UUID.randomUUID().toString());
                            try {
                                score.setPredictedPrice(Float.parseFloat(String.valueOf(shortTermData.get("price"))));
                            } catch (NumberFormatException e) {
                                score.setPredictedPrice(0.0f);
                            }
                            score.setCluster_recommendation(
                                    String.valueOf(shortTermData.get("cluster_recommendation")));
                            score.setIndicator_recommendation(
                                    String.valueOf(shortTermData.get("indicator_recommendation")));
                            score.setIndicator_used(String.valueOf(shortTermData.get("indicator_used")));
                            score.setRecommendation(String.valueOf(shortTermData.get("final_recommendation")));
                            break;
                        }
                    }
                }

                // Save the score and add it to the list
                System.out.println(-1);
                score.setUserLoanDetailsId(userloandetailsId);
                System.out.println(-1);
                create(score);
                scores.add(score);
            }

            // Return the scores as a response
            return ResponseEntity.ok(scores);

        } catch (Exception e) {
            // Handle any unexpected exceptions
            e.printStackTrace(); // Log this in production
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to calculate stock trust scores",
                    "details", e.getMessage()));
        }
    }

    // fundamenta-analysis
    @GetMapping("/fundamentals-check")
    public ResponseEntity<Map<String, String>> checkFundamentals(
            @RequestParam List<String> tickerSymbols,
            @RequestParam(required = false) Double industryPe) {

        // try {
        // Build URL with query parameters
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromHttpUrl("http://localhost:8001/fundamentals");

        // Add all ticker symbols as multiple query params
        for (String symbol : tickerSymbols) {
            builder.queryParam("ticker_symbols", symbol);
        }

        // Add industry PE if provided
        if (industryPe != null) {
            builder.queryParam("industry_pe", industryPe);
        }

        // Configure RestTemplate
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Call FastAPI endpoint with GET and query parameters
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                builder.build().toUri(),
                HttpMethod.POST,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<Map<String, Object>>() {
                });

        // Process response
        Map<String, String> result = new LinkedHashMap<>();
        if (response.getBody() != null && response.getBody().containsKey("results")) {
            List<Map<String, Object>> results = (List<Map<String, Object>>) response.getBody().get("results");
            for (Map<String, Object> item : results) {
                String ticker = (String) item.get("ticker");
                String signal = (String) item.get("signal");
                result.put(ticker, signal.contains("OKAY ✅") ? "Yes" : "No");
            }
        }

        return ResponseEntity.ok(result);
    }

    // long term analysis
    // RELIANCE,TCS
    @GetMapping("/long-term-stock-analysis")
    public ResponseEntity<Map<String, Object>> getLongTermAnalysis(@RequestParam List<String> stockSymbols) {
        // Input validation
        if (stockSymbols == null || stockSymbols.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Stock symbols list cannot be empty"));
        }

        try {
            // Add .NS suffix if not present
            // List<String> nsePrefixedSymbols = stockSymbols.stream()
            // .map(symbol -> symbol.endsWith(".NS") ? symbol : symbol + ".NS")
            // .collect(Collectors.toList());

            // Create request body
            Map<String, List<String>> requestBody = Map.of("stock_symbols", stockSymbols);

            // Set up RestTemplate
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Create the request entity
            HttpEntity<Map<String, List<String>>> requestEntity = new HttpEntity<>(requestBody, headers);

            // Make the call to FastAPI - expecting a MAP response
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    "http://127.0.0.1:8001/long_term_analysis",
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            // Handle empty responses
            if (response.getBody() == null || response.getBody().isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "error", "No analysis results found",
                                "details", "The long-term analysis completed but returned no recommendations"));
            }

            return ResponseEntity.ok(response.getBody());

        } catch (HttpClientErrorException e) {
            // Handle structured errors from FastAPI
            try {
                Map<String, Object> errorBody = new ObjectMapper().readValue(
                        e.getResponseBodyAsString(),
                        new TypeReference<Map<String, Object>>() {
                        });
                return ResponseEntity.status(e.getStatusCode())
                        .body(errorBody);
            } catch (Exception ex) {
                return ResponseEntity.status(e.getStatusCode())
                        .body(Map.of("error", e.getResponseBodyAsString()));
            }
        } catch (Exception e) {
            // Log the full error for debugging
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "error", "Failed to get long-term analysis",
                            "details", e.getMessage()));
        }
    }

    @GetMapping("/short-term-analysis")
    public ResponseEntity<List<Map<String, Object>>> getShortTermAnalysis(@RequestParam List<String> stockSymbols) {
        if (stockSymbols == null || stockSymbols.isEmpty()) {
            // return ResponseEntity.badRequest().body(
            // Map.of("error", "Stock symbols list cannot be empty")
            // );
        }
        List<String> nsePrefixedSymbols = stockSymbols.stream()
                .map(symbol -> symbol.endsWith(".NS") ? symbol : symbol + ".NS")
                .collect(Collectors.toList());

        Map<String, List<String>> requestBody = Map.of("stock_symbols", nsePrefixedSymbols);

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, List<String>>> requestEntity = new HttpEntity<>(requestBody, headers);

        // Use ParameterizedTypeReference for proper List<StockRecommendation>
        // deserialization
        ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                "http://127.0.0.1:8001/short_term_analysis",
                HttpMethod.POST,
                requestEntity,
                new ParameterizedTypeReference<List<Map<String, Object>>>() {
                });

        if (response.getBody() == null || response.getBody().isEmpty()) {
            // return ResponseEntity.status(HttpStatus.NOT_FOUND)
            // .body(Map.of("error", "No analysis results found for the provided stocks"));
        }

        return ResponseEntity.ok(response.getBody());
    }
}
