package com.trade.portfolio_microservice.service.impl;

import com.trade.portfolio_microservice.model.Transaction;
import com.trade.portfolio_microservice.repository.TransactionRepository;
import com.trade.portfolio_microservice.service.TransactionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TransactionServiceImpl implements TransactionService {

    @Autowired
    private TransactionRepository repository;

    @Override
    public List<Transaction> getAllTransactions() {
        return repository.findAll();
    }

    @Override
    public Optional<Transaction> getTransactionById(String transactionId) {
        return repository.findById(transactionId);
    }

    @Override
    public List<Transaction> getTransactionsByUserId(String userId) {
        return repository.findByUserId(userId);
    }

    @Override
    public Transaction saveTransaction(Transaction transaction) {
        // transaction.setTotalValue(transaction.getShares() * transaction.getPrice());
        return repository.save(transaction);
    }

    @Override
    public void deleteTransaction(String transactionId) {
        repository.deleteById(transactionId);
    }

    @Override
    public Transaction updateTransaction(String transactionId, Transaction updatedTransaction) {
        if (repository.existsById(transactionId)) {
            updatedTransaction.setTransactionId(transactionId);
            return repository.save(updatedTransaction);
        }
        return null;
    }
}
