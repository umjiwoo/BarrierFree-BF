package com.blindfintech.domain.transction.config.handler;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.concurrent.ConcurrentHashMap;

@Component
public class PaymentWebSocketHandler extends TextWebSocketHandler {
    private static final ConcurrentHashMap<String, WebSocketSession> sellerSessions = new ConcurrentHashMap<>();
    private static final ConcurrentHashMap<String, WebSocketSession> blindUserSessions = new ConcurrentHashMap<>();
}
