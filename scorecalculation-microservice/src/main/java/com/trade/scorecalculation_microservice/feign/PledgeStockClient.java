package com.trade.scorecalculation_microservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.trade.scorecalculation_microservice.dto.PledgedStockDetails;

@FeignClient(name="loan-microservice",path="/api/pledged-stock-guidelines")
public interface PledgeStockClient {
    @GetMapping("/user/{userId}")
    public ResponseEntity<java.util.List<PledgedStockDetails>> getPledgedStockByUserId(@PathVariable String userId);
   
}
