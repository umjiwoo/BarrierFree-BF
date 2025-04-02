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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.Optional;

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
        System.out.println("회원가입 서비스 ");
        System.out.println(userDto);

        // 비밀번호 암호화
        String hashedPassword = BCrypt.hashpw(userDto.getPassword(), BCrypt.gensalt());
        User user = UserConverter.dtoToEntity(userDto, hashedPassword);
        log.info("저장할 유저 정보: {}", user);
        userRepository.save(user);
    }

    // 로그인
    // 로그인
    public User login(LoginDto loginDto, boolean isAutoLogin, HttpServletResponse response) {
        User user = authenticate(loginDto);
        // 로그인 시 항상 JWT 생성
        String token = jwtUtil.generateToken(user.getPhoneNumber());
        setTokenInResponse(token, response);

        // 보안을 위해 비밀번호를 null로 설정하여 반환
        user.setPassword(null);
        return user;
    }

    // JWT 쿠키 및 헤더 설정
    private void setTokenInResponse(String token, HttpServletResponse response) {
        response.addHeader("Authorization", "Bearer " + token);
        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge((int) jwtUtil.getExpirationTime() / 1000); // JWT 만료 시간 설정
        response.addCookie(cookie);
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

    // 쿠키 삭제
    public void deleteCookies(HttpServletResponse response) {
        Cookie cookie = new Cookie("sessionId", null);
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0); // 즉시 만료
        cookie.setPath("/");
        response.addCookie(cookie);
    }

    // 자동 로그인 (쿠키 확인 후 갱신)
    public void autoLogin(HttpServletRequest request, HttpServletResponse response) {
        String token = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("token")) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        if (token != null && jwtUtil.validateToken(token)) {
            String userLoginId = jwtUtil.getUserLoginIdFromToken(token);
            Optional<User> user = userRepository.findByPhoneNumber(userLoginId);
            String newToken = jwtUtil.generateToken(user.get().getPhoneNumber());
            response.addHeader("Authorization", "Bearer " + newToken);
            response.addCookie(new Cookie("token", newToken));
        }
    }

    // 현재 로그인한 사용자 조회 (JWT 토큰 기반)
    public Optional<User> getUserInfo(String token) {
        String phoneNumber = jwtUtil.getUserLoginIdFromToken(token);
        return userRepository.findByPhoneNumber(phoneNumber);
    }

    // ID로 사용자 조회
    public User findByPhoneNumber(String userPhoneNumber) {
        return userRepository.findByPhoneNumber(userPhoneNumber)
                .orElseThrow(() -> new BadRequestException(UserStatusCode.USER_LOGIN_MISMATCH));
    }
    //유저 정보 조회
    public User getUserInfoById(Integer userId) {
        return userRepository.findById(userId)
                .map(user -> new User(user))  // Optional 처리
                .orElseThrow(() -> new BadRequestException(UserStatusCode.USER_ID_MISMATCH));
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        return user;
    }

}
