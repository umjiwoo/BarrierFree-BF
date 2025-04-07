package com.blindfintech.domain.transaction.config.handler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.net.URI;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Component
public class BuyerWebSocketHandler extends BasicWebSocketHandler {
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        URI uri = session.getUri();
        if (uri == null) {
            log.warn("⚠️ 결제 승인에 필요한 transactionWebSocketId 전달 안됨");
            session.close();
            return;
        }

        String query = uri.getQuery();
        String transactionWebSocketId = "";
        if(query != null) {
            String[] keyValue = query.split("=");
            transactionWebSocketId = keyValue[1];
        }

        sessions.computeIfAbsent(transactionWebSocketId, key -> new CopyOnWriteArrayList<>()).add(session);

        String transactionIdResponse = objectMapper.writeValueAsString(Map.of("transactionWebSocketId", transactionWebSocketId));
        session.sendMessage(new TextMessage(transactionIdResponse));

        log.info("✅구매자 클라이언트 연결됨: " + session.getId());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        super.afterConnectionClosed(session, status);
        log.info("❌구매자 클라이언트 연결 종료: " + session.getId());
    }
}
