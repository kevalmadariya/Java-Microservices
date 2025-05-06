package com.trade.loan_microservice.controller;


import com.trade.loan_microservice.models.Bank;
import com.trade.loan_microservice.service.BankFilterService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bank-filter")
@RequiredArgsConstructor
public class BankFilterController {

    private final BankFilterService bankFilterService;

    @GetMapping("/eligible/{loanDetailId}")
    public List<Bank> getEligibleBanks(@PathVariable String loanDetailId) {
        return bankFilterService.getEligibleBanks(loanDetailId);
    }
}
