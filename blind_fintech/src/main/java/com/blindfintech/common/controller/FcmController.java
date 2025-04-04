package com.blindfintech.common.controller;

import com.blindfintech.common.dto.FcmDto;
import com.blindfintech.common.dto.ResponseDto;
import com.blindfintech.common.entity.fcm;
import com.blindfintech.common.service.FcmService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/fcm")
public class FcmController {
    private final FcmService fcmService;

    @GetMapping
    public ResponseEntity<?> saveFcmToken(@RequestBody FcmDto fcmDto, HttpServletResponse httpServletResponse) {
        fcmService.saveFcmToken(fcmDto);

        return ResponseEntity.ok(ResponseDto.success(200, "토큰 저장 성공"));
    }


}
