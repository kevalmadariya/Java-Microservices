package com.trade.loan_microservice.controller;

import com.trade.loan_microservice.models.*;
import com.trade.loan_microservice.service.*;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pledged-stock-guidelines")
@RequiredArgsConstructor
public class PledgedStockDetailsController {
    private final PledgedStockDetailsService pledgeService;

    @PostMapping
    public ResponseEntity<List<PledgedStockDetails>> addPledgedStockDetails(
            @RequestBody List<PledgedStockDetails> pledgeList) {

        List<PledgedStockDetails> savedList = new ArrayList<>();
        for (PledgedStockDetails pledge : pledgeList) {
            PledgedStockDetails saved = pledgeService.addPledgedStockDetails(pledge);
            savedList.add(saved);
        }
        return ResponseEntity.ok(savedList);
    }

    

    @DeleteMapping("/{id}")
    public void deletePledgeStockDetailsStatus(@PathVariable String id) {
        pledgeService.deletePledgeStockDetailsStatus(id);
    }
}
