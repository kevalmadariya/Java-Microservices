package com.trade.loan_microservice.controller;

import com.trade.loan_microservice.models.*;
import com.trade.loan_microservice.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bank")
@RequiredArgsConstructor
public class BankController {
    private final BankService bankService;

    @PostMapping
    public Bank addBank(@RequestBody Bank bank) {
        return bankService.addBank(bank);
    }

    @DeleteMapping("/{id}")
    public void deleteBank(@PathVariable String id) {
        bankService.deleteBank(id);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bank> getBank(@PathVariable String id) {
        return bankService.getBank(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<Bank> getAllBanks() {
        return bankService.getAllBanks();
    }

    
}
