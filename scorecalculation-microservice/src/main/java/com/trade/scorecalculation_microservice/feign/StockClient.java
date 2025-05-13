package com.trade.scorecalculation_microservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.trade.scorecalculation_microservice.dto.Stock;

@FeignClient(name = "portfolio-microservice",path="/api/stocks") 
public interface StockClient {
    @GetMapping("/{stockId}")
    public ResponseEntity<Stock> getStockById(@PathVariable String stockId);
}
