package com.blindfintech.domain.accounts.dto;

import java.time.LocalDateTime;

public interface AccountDetailsProjection {
    Integer getId();
    String getTransactionType();
    String getTransactionName();
    Integer getTransactionAmount();
    Integer getTransactionBalance();
    LocalDateTime getTransactionDate();
    String getTransactionAccount();
    Integer getTransactionBankId();
    Boolean getTransactionStatus();
}
