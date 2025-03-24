package com.blindfintech.common.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class ResponseDto<T> {
    private final T body;

    // 성공 응답을 반환하는 싱글톤 인스턴스
    private static final ResponseDto<Void> SUCCESS = new ResponseDto<>(null);

    public static ResponseDto<Void> success() {
        return SUCCESS;
    }

    public static <T> ResponseDto<T> success(T data) {
        return new ResponseDto<>(data);
    }
}
