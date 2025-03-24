package com.blindfintech.domain.accounts.dto;

import java.time.Instant;

public interface AccountProjection {
    Integer getId();
    Integer getBankId();
    String getAccountNo();
    String getUsername();
    Long getAccountBalance();
    Integer getDailyTransferLimit();
    Integer getOneTimeTransferLimit();
    Instant getCreatedAt();
    Integer getFailedAttempts();
    String getAccountState();
}
