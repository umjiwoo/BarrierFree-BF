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
    private ResultDto result;
    private T body;

    public static <T> ResponseDto<T> success(T data) {
        return ResponseDto.<T>builder()
                .result(ResultDto.success())
                .body(data)
                .build();
    }

    public static <T> ResponseDto<T> fail(String errorCode, String msg) {
        return ResponseDto.<T>builder()
                .result(ResultDto.fail(errorCode, msg))
                .build();
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResultDto {
        private String msg;
        private String errorCode;

        public static ResultDto success() {
            return ResultDto.builder()
                    .msg("success")
                    .errorCode(null)
                    .build();
        }

        public static ResultDto fail(String errorCode, String msg) {
            return ResultDto.builder()
                    .msg(msg)
                    .errorCode(errorCode)
                    .build();
        }
    }
}
