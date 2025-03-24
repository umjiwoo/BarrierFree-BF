package com.blindfintech.domain.accounts.repository;

import com.blindfintech.domain.accounts.dto.AccountDetailsProjection;
import com.blindfintech.domain.accounts.entity.AccountTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AccountTransactionRepository extends JpaRepository<AccountTransaction, Integer> {
    @Query("""
        SELECT at.id as id, at.transactionType as transactionType,
               at.transactionName as transactionName,
               at.transactionAmount as transactionAmount,
               at.transactionBalance as transactionBalance,
               at.transactionDate as transactionDate,
               at.transactionAccount as transactionAccount,
               at.transactionBankId as transactionBankId,
               at.transactionStatus as transactionStatus
        FROM AccountTransaction at
        WHERE at.account.id = :accountId
        ORDER BY at.transactionDate DESC
    """)
    List<AccountDetailsProjection> findByAccountId(@Param("accountId") Integer accountId);
}