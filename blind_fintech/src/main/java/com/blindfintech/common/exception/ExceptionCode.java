package com.blindfintech.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum ExceptionCode {

    // NOT_FOUND_USER_ID("USER-001", "존재하지 않는 계정입니다."),
    // NOT_FOUND_USER_ID("USER-002", "비밀번호를 다시 확인해주세요.");

    NOT_FOUND_USER_ID("USER-001", "존재하지 않는 계정입니다.");

    private final String code;
    private final String message;
}
