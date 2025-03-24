package com.blindfintech.domain.users.controller;

import com.blindfintech.common.dto.ResponseDto;
import com.blindfintech.domain.users.dto.SmsDto;
import com.blindfintech.domain.users.service.SmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sms")
public class SmsController {
    private final SmsService smsService;

    @PostMapping("/send")
    public ResponseDto<String> sendMessage(@RequestBody SmsDto smsDto) {

        smsService.sendMessage(smsDto.getPhoneNumber());
        return ResponseDto.success("SMS 전송 성공"); // 성공 응답
     }

     @PostMapping("/verify")
    public ResponseDto<String> verifyMessage(@RequestBody SmsDto smsDto) {
        smsService.verifyCode(smsDto.getPhoneNumber(),smsDto.getVerificationCode());
        return ResponseDto.success("");
     }
}
