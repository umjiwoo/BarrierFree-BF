package com.blindfintech.domain.transaction.config.handler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

@Slf4j
@Component
public class RemittanceWebSocketHandler extends BasicWebSocketHandler {
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        super.afterConnectionEstablished(session);
        log.info("송금 요청 클라이언트 연결됨: " + session.getId());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        super.afterConnectionClosed(session, status);
        log.info("송금 요청 클라이언트 연결 종료: " + session.getId());
    }
}
