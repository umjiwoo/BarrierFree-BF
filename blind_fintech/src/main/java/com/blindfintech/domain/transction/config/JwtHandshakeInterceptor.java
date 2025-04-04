package com.blindfintech.domain.transction.config;

import com.blindfintech.common.jwt.JwtUtil;
import com.blindfintech.domain.users.entity.User;
import com.blindfintech.domain.users.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {
    private final JwtUtil jwtUtil;
    private final UserService userService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        log.info("Before handshake");

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
            String userPhoneNumber = jwtUtil.getUserLoginIdFromToken(token);
            User user = userService.findByPhoneNumber(userPhoneNumber);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());

            attributes.put("user", authentication);
        }
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception) {
        log.info("✅ 웹소켓 연결 성공");
    }
}

