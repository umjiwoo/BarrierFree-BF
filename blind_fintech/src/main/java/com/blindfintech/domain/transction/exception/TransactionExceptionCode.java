package com.blindfintech.domain.transction.exception;

import com.blindfintech.common.exception.ExceptionCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum TransactionExceptionCode implements ExceptionCode {
    ACCOUNT_NOT_FOUND("TRANSACTION_001", "해당 번호의 계좌가 존재하지 않습니다."),
    INSUFFICIENT_BALANCE("TRANSACTION_002","계좌 잔액을 확인해주세요.");

    private final String code;
    private final String message;
}
