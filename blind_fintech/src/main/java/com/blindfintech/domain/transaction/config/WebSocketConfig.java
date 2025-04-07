package com.blindfintech.domain.transaction.config;

import com.blindfintech.domain.transaction.config.handler.BuyerWebSocketHandler;
import com.blindfintech.domain.transaction.config.handler.RemittanceWebSocketHandler;
import com.blindfintech.domain.transaction.config.handler.SellerWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer { // websocket 구성 ; 엔드포인트 및 핸들러 등록
    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;
    private final RemittanceWebSocketHandler remittanceWebSocketHandler;
    private final SellerWebSocketHandler sellerWebSocketHandler;
    private final BuyerWebSocketHandler buyerWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(remittanceWebSocketHandler, "/ws/remittance")
                .addInterceptors(jwtHandshakeInterceptor)
                .setAllowedOrigins("*");

        registry.addHandler(sellerWebSocketHandler, "/ws/request-payment")
                .addInterceptors(jwtHandshakeInterceptor)
                .setAllowedOrigins("*");

        registry.addHandler(buyerWebSocketHandler, "/ws/accept-payment")
                .addInterceptors(jwtHandshakeInterceptor)
                .setAllowedOrigins("*");
    }
}
