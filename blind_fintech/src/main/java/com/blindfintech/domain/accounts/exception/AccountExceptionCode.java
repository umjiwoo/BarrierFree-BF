package com.blindfintech.domain.accounts.exception;

import com.blindfintech.common.exception.ExceptionCode;
import lombok.Getter;
import lombok.AllArgsConstructor;

@Getter
@AllArgsConstructor
public enum AccountExceptionCode implements ExceptionCode {
    ACCOUNT_ALREADY_EXISTS(2001, "이미 존재하는 계좌입니다."),
    PASSWORD_ERROR(2002, "비밀번호는 숫자 4자리를 입력해야합니다.");
    
    private final int code;
    private final String message;
}
