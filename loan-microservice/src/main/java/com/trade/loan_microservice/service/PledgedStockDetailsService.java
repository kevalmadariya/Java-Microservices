package com.trade.loan_microservice.service;


import com.trade.loan_microservice.models.*;
import com.trade.loan_microservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PledgedStockDetailsService  {
    private final PledgedStockDetailsRepository pledgedStockDetailsRepository;

    public PledgedStockDetails addPledgedStockDetails(PledgedStockDetails pledgedStocks) {
        return pledgedStockDetailsRepository.save(pledgedStocks);
    }

    public void deletePledgeStockDetailsStatus(String id) {
        pledgedStockDetailsRepository.deleteById(id);
    }

    public boolean existsById(String id) {
        return pledgedStockDetailsRepository.existsById(id);
    }

    public List<PledgedStockDetails> getByUserId(String userId) {
        return pledgedStockDetailsRepository.findByUserLoanDetailsId(userId);
    }

}
