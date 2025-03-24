package com.blindfintech.domain.users.service;


import com.blindfintech.common.repository.RedisRepository;
import com.blindfintech.domain.users.exception.UserExceptionCode;
import com.blindfintech.domain.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import com.blindfintech.common.exception.BadRequestException;
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
    private static final int CODE_TTL = 5; // 5분 TimeToLimit 설정

    private final RedisRepository redisRepository;
    private final UserRepository userRepository;

    public void sendMessage(String phoneNum) {
//        if (userRepository.exisByPhone(phoneNum)){
//        throw new Exception()
//    }
        String verificationCode = generateVerificationCode();

        Message message = new Message();
        message.setFrom(smsSender);
        message.setTo(phoneNum);
        message.setText("[Blind Fin] 인증 번호는 " + verificationCode + "입니다.");
        messageService.sendOne(new SingleMessageSendingRequest(message));
        redisRepository.save(phoneNum, verificationCode, CODE_TTL);
    }

    //인증 번호 생성
    private String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        return String.format("%06d", random.nextInt(1000000));
    }

    public void verifyCode(String phoneNum, String verificationCode) {
        String savedCode = getSavedCode(phoneNum);

        redisRepository.delete(phoneNum);
    }

    private String getSavedCode(String phoneNum) {
        String savedCode = (String) redisRepository.get(phoneNum);
        if (savedCode != null) {
            throw new BadRequestException(UserExceptionCode.USER_OTP_EXPIRED);
        }
        return savedCode;
    }
    /*private void validateCodeMatch(String storedCode, String inputCode) {
        if(!storedCode.equals(inputCode)) {
            throw new UserException(UserErrorCode.USER_OTP_MISMATCH);
        }
    }
*/




}
