package com.blindfintech.domain.transction.dto;

import com.blindfintech.domain.users.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Builder
@AllArgsConstructor
@Getter
public class BuyerInfoDto {
    private String fcmToken;
    private String username;

    public static BuyerInfoDto from(User user){
        return BuyerInfoDto.builder()
//TODO                .fcmToken(user.getFcmToken())
                .username(user.getUsername())
                .build();
    }
}
