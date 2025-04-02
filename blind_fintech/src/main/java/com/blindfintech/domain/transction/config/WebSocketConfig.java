package com.blindfintech.domain.transction.config;

import com.blindfintech.domain.transction.config.handler.TransactionWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer { // websocket 구성 ; 엔드포인트 및 핸들러 등록
    private final TransactionWebSocketHandler transactionWebSocketHandler;
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(transactionWebSocketHandler, "/ws")
                .setAllowedOrigins("*");
    }
    //TODO 웹소켓 연결 안됨 문제
}
