package com.blindfintech.domain.accounts.exception;

import com.blindfintech.common.exception.ExceptionCode;
import lombok.Getter;
import lombok.AllArgsConstructor;

@Getter
@AllArgsConstructor
public enum AccountExceptionCode implements ExceptionCode {
    ACCOUNT_ALREADY_EXISTS(2001, "이미 존재하는 계좌입니다."),
    PASSWORD_ERROR(2002, "비밀번호는 숫자 4자리를 입력해야합니다."),
    ONETIME_LIMIT_OVER(2003, "1회 이체 한도는 1일 이체 한도를 초과할 수 없습니다."),
    WRONG_PASSWORD(2004, "비밀번호가 틀렸습니다.");

    private final int code;
    private final String message;
}
