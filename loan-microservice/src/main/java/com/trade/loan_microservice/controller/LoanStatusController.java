package com.trade.loan_microservice.controller;

import com.trade.loan_microservice.models.*;
import com.trade.loan_microservice.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loan-status")
@RequiredArgsConstructor
public class LoanStatusController {
    private final LoanStatusService loanStatusService;

    @PostMapping
    public LoanStatus addLoanStatus(@RequestBody LoanStatus status) {
        return loanStatusService.addLoanStatus(status);
    }

    @DeleteMapping("/{id}")
    public void deleteLoanStatus(@PathVariable String id) {
        loanStatusService.deleteLoanStatus(id);
    }

    @GetMapping("/user/{userId}")
    public List<LoanStatus> getByUserId(@PathVariable String userId) {
        return loanStatusService.getByUserId(userId);
    }

    @GetMapping("/status/{status}")
    public List<LoanStatus> getByStatus(@PathVariable String status) {
        return loanStatusService.getByStatus(status);
    }

    @GetMapping
    public List<LoanStatus> getAll() {
        return loanStatusService.getAll();
    }

    @GetMapping("/bank/{bankId}")
    public List<LoanStatus> getByBankId(@PathVariable String bankId) {
        return loanStatusService.getByBankId(bankId);
    }
}
