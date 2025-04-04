package com.blindfintech.domain.transction.repository;

import com.blindfintech.domain.transction.entity.TransactionHistory;
import com.blindfintech.domain.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionHistoryRepository  extends JpaRepository<TransactionHistory, Integer> {
    Optional<TransactionHistory> findTransactionHistoryByTransactionAccount(String transactionAccountNo);

    List<TransactionHistory> findTransactionHistoriesByUser(User user);
}
