package com.blindfintech.domain.users.exception;

import com.blindfintech.common.exception.ExceptionCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum UserExceptionCode implements ExceptionCode {

    // NOT_FOUND_USER_ID("USER-001", "존재하지 않는 계정입니다."),
    // NOT_FOUND_USER_ID("USER-002", "비밀번호를 다시 확인해주세요.");

    USER_ALREADY_EXISTS("USER-001", "이미 존재하는 아이디입니다."),
    USER_OTP_EXPIRED("USER-002", "인증번호가 만료되었습니다.");
    private final String code;
    private final String message;
}
