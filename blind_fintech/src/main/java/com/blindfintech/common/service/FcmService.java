package com.blindfintech.common.service;

import com.blindfintech.common.dto.FcmDto;
import com.blindfintech.common.repository.FcmRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FcmService {
    private final FcmRepository fcmRepository;

    public void saveFcmToken(FcmDto fcmDto) {
        fcmRepository.save(fcmDto);
    }
}
