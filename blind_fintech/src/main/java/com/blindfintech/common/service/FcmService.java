package com.blindfintech.common.service;

import com.blindfintech.common.dto.FcmDto;
import com.blindfintech.common.dto.FcmMesssageDto;
import com.blindfintech.common.entity.Fcm;
import com.blindfintech.common.repository.FcmRepository;
import com.blindfintech.domain.users.entity.User;
import com.blindfintech.domain.users.repository.UserRepository;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.google.firebase.messaging.Notification;

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
    //FCM 알림 보내기
    public void sendNotification(FcmMesssageDto fcmMesssageDto) {
        User user = userRepository.findById(fcmMesssageDto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("해당 유저가 없습니다."));

        Fcm fcm = fcmRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("FCM Token을 찾을 수 없습니다."));
        System.out.println(fcm.getFcmToken());
        sendToFcmWithAdminSdk(fcm.getFcmToken(), fcmMesssageDto.getTitle(),fcmMesssageDto.getMessage());
    }

    //FCM서버로 전송
    private void sendToFcmWithAdminSdk(String fcmToken, String title, String body) {
        Message message = Message.builder()
                .setToken(fcmToken)
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                .build();

        try {
            String response = FirebaseMessaging.getInstance().send(message);
            System.out.println("FCM 메시지 전송 완료: " + response);
        } catch (FirebaseMessagingException e) {
            e.printStackTrace();
        }
    }
}

