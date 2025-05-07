package com.trade.loan_microservice.controller;

import com.trade.loan_microservice.models.*;
import com.trade.loan_microservice.service.*;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-loans")
@RequiredArgsConstructor
public class UserLoanDetailsController {
    private final UserLoanDetailsService loanDetailsService;

    @PostMapping
    public ResponseEntity<UserLoanDetails> addLoanDetail(@RequestBody UserLoanDetails detail) {
        return ResponseEntity.ok(loanDetailsService.addLoanDetail(detail));
    }

    @DeleteMapping("/{id}")
    public void deleteLoanDetail(@PathVariable String id) {
        loanDetailsService.deleteLoanDetail(id);
    }

    @GetMapping("/user/{userId}")
    public List<UserLoanDetails> getByUserId(@PathVariable String userId) {
        return loanDetailsService.getByUserId(userId);
    }

    @GetMapping
    public List<UserLoanDetails> getAll() {
        return loanDetailsService.getAll();
    }

    
}

