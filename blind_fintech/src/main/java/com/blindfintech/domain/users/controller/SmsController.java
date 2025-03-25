package com.blindfintech.domain.users.controller;

import com.blindfintech.domain.users.dto.SmsDto;
import com.blindfintech.domain.users.service.SmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sms")
public class SmsController {
    private final SmsService smsService;

    @PostMapping("/send")
    public ResponseEntity<String> sendMessage(@RequestBody SmsDto smsDto) {
        System.out.println("send: " + smsDto);
        smsService.sendMessage(smsDto.getPhoneNumber());
        return ResponseEntity.ok("SMS 전송 성공");
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyMessage(@RequestBody SmsDto smsDto) {
        smsService.verifyCode(smsDto.getPhoneNumber(), smsDto.getVerificationCode());
        return ResponseEntity.ok("인증 성공");
    }
}
