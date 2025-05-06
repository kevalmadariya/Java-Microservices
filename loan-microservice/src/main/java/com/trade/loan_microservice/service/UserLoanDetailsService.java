package com.trade.loan_microservice.service;


import com.trade.loan_microservice.models.*;
import com.trade.loan_microservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserLoanDetailsService {
    private final UserLoanDetailsRepository loanDetailsRepository;

    public UserLoanDetails addLoanDetail(UserLoanDetails loanDetails) {
        return loanDetailsRepository.save(loanDetails);
    }

    public void deleteLoanDetail(String id) {
        loanDetailsRepository.deleteById(id);
    }

    public boolean existsById(String id) {
        return loanDetailsRepository.existsById(id);
    }

    public List<UserLoanDetails> getByUserId(String userId) {
        return loanDetailsRepository.findByUserId(userId);
    }

    public List<UserLoanDetails> getAll() {
        return loanDetailsRepository.findAll();
    }
}
