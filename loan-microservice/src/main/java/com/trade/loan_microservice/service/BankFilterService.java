package com.trade.loan_microservice.service;

import com.trade.loan_microservice.models.*;
import com.trade.loan_microservice.repository.BankRepository;
import com.trade.loan_microservice.repository.SecurityGuidelinesRepository;
import com.trade.loan_microservice.repository.UserLoanDetailsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BankFilterService {

    private final UserLoanDetailsRepository loanDetailsRepository;
    private final SecurityGuidelinesRepository guidelinesRepository;
    private final BankRepository bankRepository;  // Added missing repository

    public List<Bank> getEligibleBanks(String userLoanDetailsId) {
        Optional<UserLoanDetails> optionalLoan = loanDetailsRepository.findById(userLoanDetailsId);
        if (optionalLoan.isEmpty()) {
            return List.of();
        }
    
        BigDecimal neededAmount = optionalLoan.get().getAmtLoanNeeded();
    
        // Get all security guidelines that match the loan amount criteria
        List<String> eligibleBankIds = guidelinesRepository.findAll().stream()
            .filter(g -> g.getMinimumLoan().compareTo(neededAmount) <= 0)
            .filter(g -> g.getMaximumLoan().compareTo(neededAmount) >= 0)
            .map(SecurityGuidelines::getBankId)
            .distinct()
            .collect(Collectors.toList());
    
        // Return empty list if no eligible banks found
        if (eligibleBankIds.isEmpty()) {
            return List.of();
        }
    
        // Fetch all banks with the eligible bank IDs
        return bankRepository.findAllById(eligibleBankIds);
    }
}