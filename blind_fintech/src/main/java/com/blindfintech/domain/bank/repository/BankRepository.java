package com.blindfintech.domain.bank.Repository;

import com.blindfintech.domain.bank.entity.Bank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface BankRepository extends JpaRepository<Bank, Long> {
    public Bank findBankById(Integer bankId);
}
