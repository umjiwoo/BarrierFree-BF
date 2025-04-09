package com.blindfintech.domain.transaction.dto;

import com.blindfintech.domain.users.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Builder
@AllArgsConstructor
@Getter
public class BuyerInfoDto {
    private Long userId;
    private String username;

    public static BuyerInfoDto from(User user){
        return BuyerInfoDto.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .build();
    }
}
