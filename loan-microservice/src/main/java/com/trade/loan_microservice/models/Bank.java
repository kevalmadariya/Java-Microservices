package com.trade.loan_microservice.models;

import org.springframework.data.annotation.Id;  // Use this import for MongoDB

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.mongodb.core.mapping.Document;

// 1. Bank
@Document(collection = "bank")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bank {
    @Id
    private String id;
    private String name;
}