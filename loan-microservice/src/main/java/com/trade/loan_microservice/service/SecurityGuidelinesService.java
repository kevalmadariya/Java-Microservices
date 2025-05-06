package com.trade.loan_microservice.service;

import com.trade.loan_microservice.models.*;
import com.trade.loan_microservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SecurityGuidelinesService {
    private final SecurityGuidelinesRepository guidelinesRepository;

    public SecurityGuidelines addGuideline(SecurityGuidelines guideline) {
        return guidelinesRepository.save(guideline);
    }

    public void deleteGuideline(String id) {
        guidelinesRepository.deleteById(id);
    }

    public boolean existsById(String id) {
        return guidelinesRepository.existsById(id);
    }

    public List<SecurityGuidelines> getByBankId(String bankId) {
        return guidelinesRepository.findByBank_Id(bankId);
    }

    public List<SecurityGuidelines> getAll() {
        return guidelinesRepository.findAll();
    }
}
