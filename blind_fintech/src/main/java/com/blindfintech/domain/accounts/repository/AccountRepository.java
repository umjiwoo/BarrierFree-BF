package com.blindfintech.domain.accounts.repository;

import com.blindfintech.domain.accounts.dto.AccountProjection;
import com.blindfintech.domain.accounts.entity.Account;
import com.blindfintech.domain.users.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Integer> {
    Account findAccountById(int account_id);
    @Query("""
        SELECT a.id as id, a.bankId as bankId, a.accountNo as accountNo,
            a.username as username, a.accountBalance as accountBalance,
            a.dailyTransferLimit as dailyTransferLimit,\s
            a.oneTimeTransferLimit as oneTimeTransferLimit,\s
            a.createdAt as createdAt, a.failedAttempts as failedAttempts,\s
            a.accountState as accountState
        FROM Account a
        WHERE a.user = :user
    """)
    List<AccountProjection> findAllByUser(@Param("user") User user);

    @Query("SELECT a.accountState FROM Account a WHERE a.id = :accountId")
    String findAccountStateById(@Param("accountId") Integer accountId);
    Boolean existsByAccountNo(String accountNo);

    Optional<Account> findAccountById(Integer accountId);
    Optional<Account> findAccountByAccountNo(String accountNumber);

    @Query(value = "SELECT * FROM account WHERE account_id = :accountId FOR UPDATE", nativeQuery = true)
    Optional<Account> findAccountByIdWithLock(Integer accountId);
}
