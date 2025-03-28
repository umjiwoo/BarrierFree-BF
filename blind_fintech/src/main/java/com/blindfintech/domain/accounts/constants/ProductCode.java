package com.blindfintech.domain.accounts.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ProductCode {
    REGULAR_DEPOSIT("01", "보통예금");

    private final String code;
    private final String name;
}