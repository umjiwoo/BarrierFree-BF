package com.blindfintech.common.controller;

import com.blindfintech.common.dto.FcmDto;
import com.blindfintech.common.dto.ResponseDto;
import com.blindfintech.common.service.FcmService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/fcm")
public class FcmController {
    private final FcmService fcmService;

    @PostMapping("/send-token")
    public ResponseEntity<?> saveFcmToken(@RequestBody FcmDto fcmDto) {
        System.out.println(fcmDto);
        fcmService.saveFcmToken(fcmDto);

        return ResponseEntity.ok(ResponseDto.success(200, "토큰 저장 성공"));
    }


}
