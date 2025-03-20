package com.blindfintech.domain.users.service;


import com.blindfintech.domain.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
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
        message.setFrom(smsSender);
        message.setTo(phoneNum);
        message.setText("[Blind Fin] 인증 번호는 "+verificationCode+"입니다.");
        messageService.sendOne(new SingleMessageSendingRequest(message));

}

    private String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        return String.format("%06d", random.nextInt(1000000));
    }



    }
