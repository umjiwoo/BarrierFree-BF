package com.blindfintech.domain.transction.config.handler;

import com.blindfintech.common.jwt.JwtUtil;
import com.blindfintech.domain.users.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class RemittanceWebSocketHandler extends TextWebSocketHandler {
    private final JwtUtil jwtUtil;
    private final UserService userService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String transactionId = userService.getCurrentUser().getId() + "-" + UUID.randomUUID();
        sessions.put(transactionId, session);

        String transactionIdResponse = objectMapper.writeValueAsString(Map.of("transactionId", transactionId));
        session.sendMessage(new TextMessage(transactionIdResponse));

        log.info("✅ 클라이언트 연결됨: " + session.getId());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
        log.info("❌ 클라이언트 연결 종료: " + session.getId());
    }

    public void sendTransactionResult(String transactionId, String message) throws Exception {
        WebSocketSession session = sessions.get(transactionId);

        if (session != null && session.isOpen()) {
            session.sendMessage(new TextMessage(message));
        }
    }
}
