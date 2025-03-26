package com.blindfintech.domain.accounts.exception;

import com.blindfintech.common.exception.ExceptionCode;
import lombok.Getter;
import lombok.AllArgsConstructor;

@Getter
@AllArgsConstructor
public enum AccountExceptionCode implements ExceptionCode {
    ACCOUNT_ALREADY_EXISTS("account001", "이미 존재하는 계좌입니다.");
    
    private final String code;
    private final String message;
}
