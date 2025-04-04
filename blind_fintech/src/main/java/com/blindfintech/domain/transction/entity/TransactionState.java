package com.blindfintech.domain.transction.entity;

public enum TransactionState {
    PENDING,
    PROCESSING,
    WITHDRAW_COMPLETED,
    WITHDRAW_FAILED,
    DEPOSIT_COMPLETED,
    DEPOSIT_FAILED,
    FAILED
}