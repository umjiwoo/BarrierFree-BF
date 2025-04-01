package com.blindfintech.common.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Base64;

@Slf4j
@Component
public class JwtUtil {

    private final SecretKey secretKey;

    @Value("${jwt.expiration-time:604800000}") // 7일 (7 * 24 * 60 * 60 * 1000)
    private long expirationTime;

    // 생성자에서 Base64 인코딩된 SecretKey 설정
    public JwtUtil(@Value("${jwt.secret-key}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));
    }

    // JWT 생성
    public String generateToken(String userLoginId) {
        return Jwts.builder()
                .setSubject(userLoginId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // JWT에서 사용자 ID 추출
    public String getUserLoginIdFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.getSubject();
    }

    // JWT 유효성 검사
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("JWT 토큰이 만료되었습니다: {}", e.getMessage());
        } catch (JwtException e) {
            log.warn("JWT 토큰이 유효하지 않습니다: {}", e.getMessage());
        }
        return false;
    }

    // 토큰 파싱 메서드
    private Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // 토큰 만료 시간 반환
    public long getExpirationTime() {
        return expirationTime;
    }
}
