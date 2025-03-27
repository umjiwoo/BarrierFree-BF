package com.blindfintech.domain.transction.dto;

import lombok.*;

@AllArgsConstructor
@Getter
@Builder
public class CheckAccountResultDto {
    private Integer receiverAccountId;
    private String username;

    public static CheckAccountResultDto from(Integer accountId, String username) {
        return CheckAccountResultDto.builder()
                .receiverAccountId(accountId)
                .username(username).build();
    }
}
