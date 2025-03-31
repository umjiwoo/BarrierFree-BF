package com.blindfintech.domain.users.service;

import com.blindfintech.common.exception.BadRequestException;
import com.blindfintech.common.jwt.JwtUtil;
import com.blindfintech.domain.users.converter.UserConverter;
import com.blindfintech.domain.users.dto.LoginDto;
import com.blindfintech.domain.users.dto.UserDto;
import com.blindfintech.domain.users.entity.User;
import com.blindfintech.domain.users.exception.UserStatusCode;
import com.blindfintech.domain.users.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    // 아이디 중복 확인 - 유저 휴대폰 번호 기준으로
    public void checkUserIdExists(String phoneNumber) {
        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new BadRequestException(UserStatusCode.USER_ALREADY_EXISTS);
        }
    }

    // 회원가입
    public void signUp(UserDto userDto) {
        log.info("회원가입 요청: {}", userDto);

        // 비밀번호 암호화
        String hashedPassword = BCrypt.hashpw(userDto.getPassword(), BCrypt.gensalt());
        User user = UserConverter.dtoToEntity(userDto, hashedPassword);
        log.info("저장할 유저 정보: {}", user);
        userRepository.save(user);
    }

    // 로그인
    public User login(LoginDto loginDto, boolean isAutoLogin, HttpServletResponse response) {
        User user = authenticate(loginDto);

        if (isAutoLogin) {
            String token = jwtUtil.generateToken(user.getPhoneNumber());
            response.addHeader("Authorization", "Bearer " + token);
            response.addCookie(new Cookie("token", token));
        }

        return user;
    }

    // 비밀번호 인증
    private User authenticate(LoginDto loginDto) {
        String phoneNumber = loginDto.getPhoneNumber();
        String password = loginDto.getPassword();

        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new BadRequestException(UserStatusCode.USER_LOGIN_MISMATCH));

        if (!BCrypt.checkpw(password, user.getPassword())) {
            throw new BadRequestException(UserStatusCode.USER_PASSWORD_MISMATCH);
        }

        return user;
    }

    // 자동 로그인 설정
    public void setAutoLogin(HttpServletResponse response) {
        String token = UUID.randomUUID().toString();
        Cookie cookie = new Cookie("autoLogin", token);
        cookie.setPath("/");
        response.addCookie(cookie);
    }

    // 쿠키 삭제
    public void deleteCookies(HttpServletResponse response) {
        Cookie cookie = new Cookie("sessionId", null);
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0); // 즉시 만료
        cookie.setPath("/");
        response.addCookie(cookie);
    }

    // 유저 정보 조회
    public Optional<User> getUserInfo(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber);
    }

    // 자동 로그인 (쿠키 확인 후 갱신)
    public void autoLogin(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("sessionId".equals(cookie.getName())) {
                    cookie.setMaxAge(7 * 24 * 60 * 60);
                    response.addCookie(cookie);
                    return;
                }
            }
        }
    }

    // 현재 로그인한 사용자 조회 (JWT 토큰 기반)
    public Optional<User> getCurrentUser(String token) {
        String phoneNumber = jwtUtil.getUserLoginIdFromToken(token);
        return userRepository.findByPhoneNumber(phoneNumber);
    }

    // ID로 사용자 조회
    public User findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException(UserStatusCode.USER_NOT_FOUND));
    }
}
