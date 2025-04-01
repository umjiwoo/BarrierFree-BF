package com.blindfintech.domain.users.exception;

import com.blindfintech.common.exception.ExceptionCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

// Use는 1000번대 부터 시작
@RequiredArgsConstructor
@Getter
public enum UserStatusCode implements ExceptionCode {

    // NOT_FOUND_USER_ID("USER-001", "존재하지 않는 계정입니다."),
    // NOT_FOUND_USER_ID("USER-002", "비밀번호를 다시 확인해주세요.");

    USER_ALREADY_EXISTS(1001, "이미 존재하는 아이디입니다."),
    USER_OTP_EXPIRED(1002, "인증번호가 만료되었습니다."),
    USER_OTP_MISMATCH(1003,"인증번호가 일치하지 않습니다." ),
    USER_LOGIN_MISMATCH(1004,"아이디가 일치하지 않습니다."),
    USER_PASSWORD_MISMATCH(1005,"비밀번호가 일치하지 않습니다."),
    USER_ID_MISMATCH(1006,"해당 유저 id가 존재하지 않습니다.");;

    private final int code;
    private final String message;
}
