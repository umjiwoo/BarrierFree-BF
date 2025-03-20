package com.blindfintech.domain.users.controller;

import com.blindfintech.domain.users.dto.SmsDto;
import com.blindfintech.domain.users.service.SmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sms/")
public class SmsController {
    private final SmsService smsService;

    @PostMapping("/send")
    public sendMessage(@RequestBody SmsDto smsDto){
        smsService.
    }
}
