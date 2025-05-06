package com.trade.loan_microservice.controller;

import com.trade.loan_microservice.models.*;
import com.trade.loan_microservice.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/security-guidelines")
@RequiredArgsConstructor
public class SecurityGuidelinesController {
    private final SecurityGuidelinesService guidelinesService;

    @PostMapping
    public SecurityGuidelines addGuideline(@RequestBody SecurityGuidelines guideline) {
        return guidelinesService.addGuideline(guideline);
    }

    @DeleteMapping("/{id}")
    public void deleteGuideline(@PathVariable String id) {
        guidelinesService.deleteGuideline(id);
    }

    @GetMapping("/bank/{bankId}")
    public List<SecurityGuidelines> getByBankId(@PathVariable String bankId) {
        return guidelinesService.getByBankId(bankId);
    }

    @GetMapping
    public List<SecurityGuidelines> getAll() {
        return guidelinesService.getAll();
    }
}

