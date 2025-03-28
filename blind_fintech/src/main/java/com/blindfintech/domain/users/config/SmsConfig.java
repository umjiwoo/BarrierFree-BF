package com.blindfintech.domain.users.config;

import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration  // 스프링 설정 파일임을 명시
public class SmsConfig {

    @Value("${spring.sms.api-key}")  // application.properties에서 값 주입
    private String apiKey;

    @Value("${spring.sms.api-secret}")
    private String apiSecret;

    @Value("${spring.sms.provider}")
    private String smsProvider;

    @Bean  // DefaultMessageService를 스프링 빈으로 등록
    public DefaultMessageService defaultMessageService() {
        return NurigoApp.INSTANCE.initialize(apiKey, apiSecret, "https://api.coolsms.co.kr");
    }
}