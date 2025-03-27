package com.blindfintech.domain.accounts.dto;

import java.time.LocalDateTime;

public interface AccountProjection {
    Integer getId();
    Integer getBankId();
    String getAccountNo();
    String getUsername();
    Long getAccountBalance();
    Integer getDailyTransferLimit();
    Integer getOneTimeTransferLimit();
    LocalDateTime getCreatedAt();
    Integer getFailedAttempts();
    String getAccountState();
}
