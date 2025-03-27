package com.blindfintech.domain.accounts.repository;

import com.blindfintech.domain.accounts.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    Optional<Account> findAccountById(Integer accountId);
    Optional<Account> findAccountByAccountNo(String accountNumber);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Account> findByIdWithLock(Integer accountId);
}
