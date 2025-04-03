package com.blindfintech.domain.transction.config;

import com.blindfintech.common.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;

@Slf4j
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {
    private final JwtUtil jwtUtil;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest httpRequest = servletRequest.getServletRequest();
            Optional<String> tokenOpt = Optional.ofNullable(httpRequest.getCookies()).stream().flatMap(Arrays::stream) // 쿠키가 없을 경우 빈 스트림 반환
                    .filter(cookie -> "token".equals(cookie.getName()))
                    .map(Cookie::getValue)
                    .findFirst();

            if (tokenOpt.isEmpty()) {
                log.warn("❌ JWT 토큰 없음. 웹소켓 연결 거부");
                return false;
            }

            String token = tokenOpt.get();
            if (!jwtUtil.validateToken(token)) {
                log.warn("❌ 유효하지 않은 토큰. 웹소켓 연결 거부");
                return false;
            }

            // JWT에서 사용자 정보 추출
            String userId = jwtUtil.getUserLoginIdFromToken(token);
            attributes.put("userId", userId);
            log.info("✅ JWT 인증 성공. userId: {}", userId);
        }
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception) {
        log.info("✅ 웹소켓 연결 성공");
    }
}

