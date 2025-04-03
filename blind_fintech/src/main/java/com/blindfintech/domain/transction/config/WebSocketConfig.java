package com.blindfintech.domain.transction.config;

import com.blindfintech.domain.transction.config.handler.RemittanceWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer { // websocket 구성 ; 엔드포인트 및 핸들러 등록
    private final RemittanceWebSocketHandler remittanceWebSocketHandler;
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(remittanceWebSocketHandler, "/ws/remittance")
                .setAllowedOrigins("*");
    }
}
