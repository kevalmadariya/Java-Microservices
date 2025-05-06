package com.trade.loan_microservice.controller;

import com.trade.loan_microservice.models.*;
import com.trade.loan_microservice.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pledged-stock-guidelines")
@RequiredArgsConstructor
public class PledgedStockDetailsController {
    private final PledgedStockDetailsService pledgeService;

    @PostMapping
    public PledgedStockDetails addPledgedStockDetails(@RequestBody PledgedStockDetails guideline) {
        return pledgeService.addPledgedStockDetails(guideline);
    }

    @DeleteMapping("/{id}")
    public void deletePledgeStockDetailsStatus(@PathVariable String id) {
        pledgeService.deletePledgeStockDetailsStatus(id);
    }
}

