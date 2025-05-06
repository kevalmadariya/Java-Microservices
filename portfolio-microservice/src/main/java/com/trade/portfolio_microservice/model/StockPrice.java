// package com.trade.portfolio_microservice.model;

// import java.time.LocalDate;

// import org.springframework.data.annotation.Id;
// import org.springframework.data.mongodb.core.mapping.Document;

// import lombok.AllArgsConstructor;
// import lombok.Data;
// import lombok.NoArgsConstructor;

// @Document(collection = "stock_price")
// @Data
// @NoArgsConstructor
// @AllArgsConstructor
// public class StockPrice {
//     @Id
//     private String id;
//     private LocalDate date;
//     private Double open;
//     private Double high;
//     private Double low;
//     private Double close;
//     private Long volume;

//     // Indicators
//     private Double sma5;
//     private Double sma20;
//     private Double sma50;
//     private Double rsi14;
//     private Double priceLag1;
//     private Double priceLag2;

//     private String stockId;
// }

