package com.blindfintech.domain.bank.Repository;

import com.blindfintech.domain.bank.entity.Bank;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BankRepository extends JpaRepository<Bank, Long> {
    Bank findBankById(Integer id);
}
