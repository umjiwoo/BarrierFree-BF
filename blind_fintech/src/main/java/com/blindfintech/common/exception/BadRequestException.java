package com.blindfintech.common.exception;

import lombok.Getter;

@Getter
public class BadRequestException extends BaseException {

    public BadRequestException(ExceptionCode exceptionCode) {
        super(exceptionCode);
    }

    public BadRequestException(String message) {
        super(400, message);
    }
}
