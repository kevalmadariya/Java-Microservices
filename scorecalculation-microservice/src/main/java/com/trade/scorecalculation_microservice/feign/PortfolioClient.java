package com.trade.scorecalculation_microservice.feign;
import java.util.List;
import com.trade.scorecalculation_microservice.dto.*;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "portfolio-microservice",path="/api/transactions") 
public interface PortfolioClient {

    @GetMapping("/user/{userId}")
    public List<Transaction> getTransactionsByUserId(@PathVariable String userId);

}