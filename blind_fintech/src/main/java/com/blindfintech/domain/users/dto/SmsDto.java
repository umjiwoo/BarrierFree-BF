package com.blindfintech.domain.users.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SmsDto {
    String phoneNumber;
    String verificationCode;
}
