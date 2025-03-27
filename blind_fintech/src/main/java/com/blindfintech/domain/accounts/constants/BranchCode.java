package com.blindfintech.domain.accounts.constants;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum BranchCode {
    ONLINE("119", "온라인");

    private final String code;
    private final String name;
}