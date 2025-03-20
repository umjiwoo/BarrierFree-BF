package com.blindfintech.domain.users.service;


import com.blindfintech.domain.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.service.DefaultMessageService;

import lombok.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class SmsService {
    @Value("${spring.sms.sender}")
    private String smsSender;

    private final DefaultMessageService messageService;
//    private final RedisRepository redisRepository;
    private final UserRepository userRepository;

    public void sendMessage(String phoneNum){
//        if (userRepository.exisByPhone(phoneNum)){
//        throw new Exception()
//    }
        String verificationCode = generateVerificationCode();

        Message message = new Message();



}

    private String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        return String.format("%06d", random.nextInt(1000000));
    }



    }
