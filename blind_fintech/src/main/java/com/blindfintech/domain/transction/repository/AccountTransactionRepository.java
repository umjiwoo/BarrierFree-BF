package com.blindfintech.domain.transction.repository;

import com.blindfintech.domain.transction.entity.AccountTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountTransactionRepository extends JpaRepository<AccountTransaction, Long> {

}
