package com.blindfintech.common.exception;

import lombok.Getter;

@Getter
public class NotFoundException extends BaseException{

    public NotFoundException(ExceptionCode exceptionCode) {
        super(exceptionCode);
    }

    public NotFoundException(String message) {
        super(404, message);
    }

}
