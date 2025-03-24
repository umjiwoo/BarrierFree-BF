package com.blindfintech.domain.accounts.dto;

import java.time.Instant;

public interface AccountDetailsProjection {
    Integer getId();
    String getTransactionType();
    String getTransactionName();
    Integer getTransactionAmount();
    Integer getTransactionBalance();
    Instant getTransactionDate();
    String getTransactionAccount();
    Integer getTransactionBankId();
    Boolean getTransactionStatus();
}
