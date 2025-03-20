package com.blindfintech.domain.accounts.repository;

import com.blindfintech.domain.accounts.entity.Account;
import com.blindfintech.domain.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AccountRepository extends JpaRepository<Account, Integer> {
    @Query("""
        SELECT a.id, a.bankId, a.accountNo, a.username, a.accountBalance,
        a.dailyTransferLimit, a.oneTimeTransferLimit, a.createdAt,
        a.failedAttempts, a.accountState
        FROM Account a
        WHERE a.user = :user
    """)
    List<Account> findAllByUser(@Param("user") User user);
}
