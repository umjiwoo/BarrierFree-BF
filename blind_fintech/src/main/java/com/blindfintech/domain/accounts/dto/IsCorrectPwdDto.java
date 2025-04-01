package com.blindfintech.domain.accounts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class IsCorrectPwdDto {
    private boolean isCorrect;
    private boolean isLocked;
}
