package com.blindfintech.common.service;

import com.blindfintech.common.dto.FcmMesssageDto;
import com.blindfintech.domain.transaction.dto.PaymentRequestDto;
import com.blindfintech.domain.transaction.dto.PushMessageDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class FcmMessageFactory {
    private static final ObjectMapper objectMapper=new ObjectMapper();

    public static FcmMesssageDto from(PushMessageDto pushMessageDto) {
        String json = "";
        try {
            json = objectMapper.writeValueAsString(pushMessageDto);
        } catch (Exception e) {
            //
        }

        return FcmMesssageDto.builder()
                .userId(pushMessageDto.getSenderId())
                .title("결제 요청 알림")
                .message(json)
                .build();
    }
}

