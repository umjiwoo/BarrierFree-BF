package com.blindfintech.domain.transction.config.handler;

import com.blindfintech.domain.users.entity.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class BasicWebSocketHandler extends TextWebSocketHandler {
    protected final ObjectMapper objectMapper = new ObjectMapper();
    protected final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        UsernamePasswordAuthenticationToken authentication =
                (UsernamePasswordAuthenticationToken) session.getAttributes().get("user");

        if (authentication == null) {
            log.warn("⚠️ 인증되지 않은 사용자의 웹소켓 연결 요청입니다. 세션 종료");
            session.close();
            return;
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = (User)authentication.getPrincipal();
        String transactionWebSocketId = user.getId() + "-" + UUID.randomUUID();

        sessions.put(transactionWebSocketId, session);
        session.getAttributes().put("transactionWebSocketId", transactionWebSocketId);

        String transactionIdResponse = objectMapper.writeValueAsString(Map.of("transactionWebSocketId", transactionWebSocketId));
        session.sendMessage(new TextMessage(transactionIdResponse));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
    }

    public void sendTransactionResult(String transactionWebSocketId, String message) throws Exception {
        WebSocketSession session = sessions.get(transactionWebSocketId);

        if (session != null && session.isOpen()) {
            session.sendMessage(new TextMessage(message));
        }
    }
}
