// package com.trade.portfolio_microservice.controller;

// import com.trade.portfolio_microservice.model.StockPrice;
// import com.trade.portfolio_microservice.repository.StockPriceRepository;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.List;

// @RestController
// @RequestMapping("/api/processed-stock")
// public class StockPriceController {

//     @Autowired
//     private StockPriceRepository stockPriceRepository;

//     @PostMapping("/save")
//     public ResponseEntity<String> saveStockData(@RequestBody List<StockPrice> stockDataList) {
//         try {
//             stockPriceRepository.saveAll(stockDataList);
//             return ResponseEntity.ok("Stock data saved successfully");
//         } catch (Exception e) {
//             return ResponseEntity.internalServerError().body("Error saving stock data: " + e.getMessage());
//         }
//     }
// }
