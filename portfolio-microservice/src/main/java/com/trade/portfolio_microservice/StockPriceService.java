package com.trade.portfolio_microservice;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

class StockPriceResponse {
    private String symbol;
    private Double price;

    // Getters and setters
    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}

@Service
public class StockPriceService {

    private final String pythonServiceUrl = "http://localhost:8000/stock_price/"; // Update port if different

    private final RestTemplate restTemplate = new RestTemplate();

    public double getLatestPrice(String stockSymbol) {
        try {
            String url = pythonServiceUrl + stockSymbol;
            StockPriceResponse response = restTemplate.getForObject(url, StockPriceResponse.class);
            return (response != null && response.getPrice() != null) ? response.getPrice() : 0.0;
        } catch (Exception e) {
            System.err.println("Failed to fetch price for " + stockSymbol + ": " + e.getMessage());
            return 0.0;
        }
    }

}
