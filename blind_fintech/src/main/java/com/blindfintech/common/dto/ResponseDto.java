package com.blindfintech.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResponseDto<T> {
    private Result result;
    private T body;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Result {
        private int code;
        private String message;
    }

    public static <T> ResponseDto<T> success(int code, String message, T body) {
        return ResponseDto.<T>builder()
                .result(new Result(code, message))
                .body(body)
                .build();
    }

    public static ResponseDto<Void> success(int code, String message) {
        return ResponseDto.<Void>builder()
                .result(new Result(code, message))
                .body(null)
                .build();
    }

    public static ResponseDto<Void> error(int code, String message) {
        return ResponseDto.<Void>builder()
                .result(new Result(code, message))
                .body(null)
                .build();
    }
}
