package com.trade.loan_microservice.service;

import com.trade.loan_microservice.models.*;
import com.trade.loan_microservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BankService {
    private final BankRepository bankRepository;

    public Bank addBank(Bank bank) {
        return bankRepository.save(bank);
    }

    public void deleteBank(String id) {
        bankRepository.deleteById(id);
    }

    public boolean existsById(String id) {
        return bankRepository.existsById(id);
    }

    public Optional<Bank> getBank(String id) {
        return bankRepository.findById(id);
    }

    public List<Bank> getAllBanks() {
        return bankRepository.findAll();
    }

    public Optional<Bank> findByEmail(String email) {
        return bankRepository.findByEmail(email);
    }
}
