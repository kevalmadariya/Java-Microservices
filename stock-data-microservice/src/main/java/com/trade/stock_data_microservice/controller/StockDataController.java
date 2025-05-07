package com.trade.stock_data_microservice.controller;

import java.net.http.HttpHeaders;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.trade.stock_data_microservice.dao.StockDTO;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/stock")
public class StockDataController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/update")
    public ResponseEntity<Void> updateStockData(@RequestBody List<StockDTO> stocks) {
        System.out.println(-1);
        System.out.println(stocks.getFirst().getPrice());
        messagingTemplate.convertAndSend("/topic/stocks", stocks);
        return ResponseEntity.ok().build();
    }

    // @GetMapping("/fetch-once")
    // public String fetchOnceAndSend() {
    //     try {
    //         RestTemplate restTemplate = new RestTemplate();

    //         // Step 1: Call Python FastAPI
    //         String pythonApi = "http://localhost:8000/fetch-once/";
    //         String stockDataJson = restTemplate.getForObject(pythonApi, String.class);

    //         // Step 2: Send to another microservice
    //         String targetMicroserviceUrl = "http://localhost:8082/api/processed-stock/save"; // replace as needed
    //         restTemplate.postForObject(targetMicroserviceUrl, stockDataJson, String.class);

    //         return "Data forwarded successfully";
    //     } catch (Exception e) {
    //         return "Error: " + e.getMessage();
    //     }
    // }

}
