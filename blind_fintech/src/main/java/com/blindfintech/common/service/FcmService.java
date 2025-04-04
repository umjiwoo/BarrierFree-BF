package com.blindfintech.common.service;

import com.blindfintech.common.dto.FcmDto;
import com.blindfintech.common.entity.Fcm;
import com.blindfintech.common.repository.FcmRepository;
import com.blindfintech.domain.users.entity.User;
import com.blindfintech.domain.users.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FcmService {

    private final FcmRepository fcmRepository;
    private final UserRepository userRepository;

    @Transactional
    public void saveFcmToken(FcmDto fcmDto) {
        User user = userRepository.findById(fcmDto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 존재하지 않습니다."));

        // 이미 등록된 토큰이 있다면 갱신
        Fcm fcm = fcmRepository.findByUser(user)
                .orElseGet(() -> {
                    Fcm newFcm = new Fcm();
                    newFcm.setUser(user);
                    return newFcm;
                });

        fcm.setFcmToken(fcmDto.getFcmToken());
        fcmRepository.save(fcm);
    }
}