package com.blindfintech.common.controller;

import com.blindfintech.common.dto.ResponseDto;
import com.blindfintech.domain.users.dto.SmsDto;
import com.blindfintech.common.service.SmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sms")
public class SmsController {
    private final SmsService smsService;
    
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestParam String phoneNumber) {
        System.out.println("send: " + phoneNumber);
        smsService.sendMessage(phoneNumber);
        return ResponseEntity.ok(ResponseDto.success(200, "SMS 전송 성공"));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyMessage(@RequestBody SmsDto smsDto) {
        smsService.verifyCode(smsDto.getPhoneNumber(), smsDto.getVerificationCode());
        return ResponseEntity.ok(ResponseDto.success(200,"SMS 인증 성공"));
    }
}
