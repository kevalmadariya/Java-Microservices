package com.trade.loan_microservice.controller;

import com.trade.loan_microservice.models.*;
import com.trade.loan_microservice.repository.*;
import com.trade.loan_microservice.service.SecurityGuidelinesService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/loan")
public class LoanController {

    private final SecurityGuidelinesService sgs;
    private final UserLoanDetailsRepository userLoanDetailsRepository;
    private final PledgedStockRepository pledgedStockDetailsRepository;
    private final BankRepository bankRepository;
    private final SecurityGuidelinesRepository securityGuidelinesRepository;
    private final RestTemplate restTemplate;
    private final String STOCK_API_URL = "http://localhost:8000/stock_price/"; // Replace with actual stock API URL

    public LoanController(UserLoanDetailsRepository userLoanDetailsRepository,
            PledgedStockRepository pledgedStockDetailsRepository,
            BankRepository bankRepository,
            SecurityGuidelinesRepository securityGuidelinesRepository,
            RestTemplate restTemplate,
            SecurityGuidelinesService sgs) {
        this.userLoanDetailsRepository = userLoanDetailsRepository;
        this.pledgedStockDetailsRepository = pledgedStockDetailsRepository;
        this.bankRepository = bankRepository;
        this.securityGuidelinesRepository = securityGuidelinesRepository;
        this.restTemplate = restTemplate;
        this.sgs = sgs;
    }

    @GetMapping("/temp/")
    public Optional<SecurityGuidelines> temp(String bankId) {
        return securityGuidelinesRepository.findByBankId(bankId);
    }

    @GetMapping("/eligible-banks/{userLoanDetailsId}")
    public ResponseEntity<List<Bank>> getEligibleBanks(@PathVariable String userLoanDetailsId) {
        // 1. Fetch user loan details
        UserLoanDetails userLoanDetails = userLoanDetailsRepository.findById(userLoanDetailsId)
                .orElseThrow(() -> new RuntimeException("User loan details not found"));

        // 2. Get all pledged stocks for this user loan
        List<PledgedStockDetails> pledgedStocks = pledgedStockDetailsRepository
                .findByUserLoanDetailsId(userLoanDetailsId);

        // 3. Calculate total value of pledged stocks
        BigDecimal totalValue = BigDecimal.ZERO;

        for (PledgedStockDetails stock : pledgedStocks) {
            // Fetch real-time stock price
            BigDecimal currentPrice = fetchStockPrice(stock.getStockId());

            // Calculate value of this stock (quantity * price)
            BigDecimal stockValue = currentPrice.multiply(BigDecimal.valueOf(stock.getQuantity()));
            totalValue = totalValue.add(stockValue);
        }
        // 4. Calculate LTV ratio
        if (totalValue.compareTo(BigDecimal.ZERO) == 0) {
            throw new RuntimeException("Total pledged stock value cannot be zero");
        }
        
        BigDecimal ltvRatio = userLoanDetails.getAmtLoanNeeded()
        .divide(totalValue, 4, BigDecimal.ROUND_HALF_UP)
        .multiply(BigDecimal.valueOf(100));
        
        // 5. Get all banks
        List<Bank> allBanks = bankRepository.findAll();
        
        // 6. Filter banks based on their security guidelines' LTV
        List<Bank> eligibleBanks = allBanks.stream()
        .filter(bank -> {
            try {
                SecurityGuidelines guidelines = sgs.getByBankId(bank.getId());
                System.out.println(-1);
                System.out.println(ltvRatio);
                System.out.println(guidelines.getLTV());

                return guidelines.getLTV().compareTo(ltvRatio) >= 0;
            } catch (RuntimeException e) {
                // Bank has no guidelines - consider it ineligible
                return false;
            }
        })
        .collect(Collectors.toList());

        return ResponseEntity.ok(eligibleBanks);
    }

    private BigDecimal fetchStockPrice(String stockId) {
        try {
            String apiUrl = STOCK_API_URL + stockId;
            StockPriceResponse response = restTemplate.getForObject(apiUrl, StockPriceResponse.class);
            return response.getPrice();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch stock price for ID: " + stockId, e);
        }
    }

    private static class StockPriceResponse {
        private BigDecimal price;

        public BigDecimal getPrice() {
            return price;
        }

        public void setPrice(BigDecimal price) {
            this.price = price;
        }
    }
}