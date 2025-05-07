package com.trade.loan_microservice.service;

import com.trade.loan_microservice.models.*;
import com.trade.loan_microservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LoanStatusService {
    private final LoanStatusRepository loanStatusRepository;

    public LoanStatus addLoanStatus(LoanStatus loanStatus) {
        return loanStatusRepository.save(loanStatus);
    }

    public void deleteLoanStatus(String id) {
        loanStatusRepository.deleteById(id);
    }

    public boolean existsById(String id) {
        return loanStatusRepository.existsById(id);
    }

    public List<LoanStatus> getByUserId(String userId) {
        return loanStatusRepository.findByUserId(userId);
    }

    public List<LoanStatus> getByStatus(String status) {
        return loanStatusRepository.findByStatus(status);
    }

    public List<LoanStatus> getByBankId(String bankId) {
        return loanStatusRepository.findByBankId(bankId);
    }

    public List<LoanStatus> getAll() {
        return loanStatusRepository.findAll();
    }
}
