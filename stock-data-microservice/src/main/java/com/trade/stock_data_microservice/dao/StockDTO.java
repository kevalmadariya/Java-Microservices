package com.trade.stock_data_microservice.dao;

public class StockDTO {
    private String symbol;
    private String name;
    private Double price;
    private Double rsi14;
    private Double sma20;
    private Double sma50;

    // Constructors
    public StockDTO() {}

    public StockDTO(String symbol, String name, Double price, Double rsi14, Double sma20, Double sma50) {
        this.symbol = symbol;
        this.name = name;
        this.price = price;
        this.rsi14 = rsi14;
        this.sma20 = sma20;
        this.sma50 = sma50;
    }

    // Getters and setters (or use Lombok @Data to reduce boilerplate)

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Double getRsi14() { return rsi14; }
    public void setRsi14(Double rsi14) { this.rsi14 = rsi14; }

    public Double getSma20() { return sma20; }
    public void setSma20(Double sma20) { this.sma20 = sma20; }

    public Double getSma50() { return sma50; }
    public void setSma50(Double sma50) { this.sma50 = sma50; }
}
