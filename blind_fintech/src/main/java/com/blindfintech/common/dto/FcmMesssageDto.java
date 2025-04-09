package com.blindfintech.common.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FcmMesssageDto {
    private Long userId;
    private String title;
    private String message;
}
