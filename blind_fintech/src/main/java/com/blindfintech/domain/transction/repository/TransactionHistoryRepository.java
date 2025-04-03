package com.blindfintech.domain.transction.repository;

import com.blindfintech.domain.transction.entity.TransactionHistory;
import com.blindfintech.domain.transction.entity.TransactionLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransactionHistoryRepository  extends JpaRepository<TransactionHistory, Integer> {
    Optional<TransactionHistory> findTransactionHistoryByTransactionAccount(String transactionAccountNo);
}
