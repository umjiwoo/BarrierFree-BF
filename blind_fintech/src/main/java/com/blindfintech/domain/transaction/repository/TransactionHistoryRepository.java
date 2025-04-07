package com.blindfintech.domain.transaction.repository;

import com.blindfintech.domain.transaction.entity.TransactionHistory;
import com.blindfintech.domain.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionHistoryRepository  extends JpaRepository<TransactionHistory, Integer> {
    Optional<TransactionHistory> findTransactionHistoryByUser_IdAndTransactionAccount(Long userId, String transactionAccountNo);

    List<TransactionHistory> findTransactionHistoriesByUser(User user);
}
