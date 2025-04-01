package com.blindfintech.common.ai;

import com.blindfintech.common.exception.ExceptionCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

// Use는 1000번대 부터 시작
@RequiredArgsConstructor
@Getter
public enum AiStatusCode implements ExceptionCode {

    API_COMMUNICATION_FAILURE(4000,"API 통신 실패"),
    API_INVALID_RESPONSE(4001, "API 잘못된 응답");
    private final int code;
    private final String message;
}
