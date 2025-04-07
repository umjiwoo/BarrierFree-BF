package com.blindfintech.common.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class FcmMesssageDto {
    private Integer userId;
    private String title;
    private String message;
}
