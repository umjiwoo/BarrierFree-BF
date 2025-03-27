package com.blindfintech.common.exception;

public class TokenException extends BaseException {

    public TokenException(ExceptionCode exceptionCode) {
        super(exceptionCode);
    }

    public TokenException(String message) {
        super(401, message);
    }
}
