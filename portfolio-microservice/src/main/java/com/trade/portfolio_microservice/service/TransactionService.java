package com.trade.portfolio_microservice.service;

import com.trade.portfolio_microservice.model.Transaction;

import java.util.List;
import java.util.Optional;

public interface TransactionService {

    List<Transaction> getAllTransactions();

    Optional<Transaction> getTransactionById(String transactionId);

    List<Transaction> getTransactionsByUserId(String userId);

    Transaction saveTransaction(Transaction transaction);

    void deleteTransaction(String transactionId);

    Transaction updateTransaction(String transactionId, Transaction updatedTransaction);
}
