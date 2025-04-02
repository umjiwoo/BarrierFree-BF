package com.blindfintech.domain.accounts.dto;

import lombok.*;

@Getter
@Builder
@Data
@AllArgsConstructor(access = AccessLevel.PROTECTED)
public class AccountInputDto {
    private String username;
    private Integer dailyTransferLimit;
    private Integer oneTimeTransferLimit;
    private String accountPassword;


}
