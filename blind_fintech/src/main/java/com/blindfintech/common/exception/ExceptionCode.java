package com.blindfintech.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

public interface ExceptionCode {
    String getCode();
    String getMessage();
}
