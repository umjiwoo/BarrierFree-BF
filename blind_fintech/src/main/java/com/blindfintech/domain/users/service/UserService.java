package com.blindfintech.domain.users.service;

import com.blindfintech.common.exception.BadRequestException;
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

    private final UserRepository userRepository;

    // 아이디 중복 확인 - 유저 휴대폰 번호 기준으로
    public void checkUserIdExists(String phoneNumber) {
        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new BadRequestException(UserStatusCode.USER_ALREADY_EXISTS);
        }
        return;
    }

    // 회원가입
    public void signUp(UserDto userDto) {
        log.info("회원가입 요청: {}", userDto);

        //BCrypt 암호화
        String hashedPassword = BCrypt.hashpw(userDto.getPassword(), BCrypt.gensalt());

        // 해시된 비밀번호 전달하여 중복 코드 제거
        User user = UserConverter.dtoToEntity(userDto, hashedPassword);

        log.info("저장할 유저 정보: {}", user);
        userRepository.save(user);
    }

    public User login(LoginDto loginDto, boolean isAutoLogin, HttpServletResponse response) {
        if (isAutoLogin) {
            setAutoLogin(loginDto, response);
        }
        return authenticate(loginDto);

    }

    private void setAutoLogin(LoginDto loginDto, HttpServletResponse response) {
        String token = UUID.randomUUID().toString();
        Cookie cookie = new Cookie("autoLogin", token);
        cookie.setPath("/");
        response.addCookie(cookie);
    }

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

    // 로그인 - ID로 유저 찾기
//    public Optional<User> getUserByLoginId(String loginId) {
//        return userRepository.findById(loginId);
//    }

    public void deleteCookies(HttpServletResponse response) {
        Cookie cookie = new Cookie("sessionId", null); // 쿠키 이름 설정 (예: "sessionId")
        cookie.setHttpOnly(true); //서버에서만 접근 가능
        cookie.setMaxAge(7 * 24 * 60 * 60); // 쿠키 만료 시간 7일
        cookie.setPath("/"); // 애플리케이션 전체에서 쿠키 삭제 가능하도록 설정
        response.addCookie(cookie); // 응답에 쿠키 추가
    }


    public Optional<User> getUserInfo(String phoneNumber, HttpServletResponse response) {
        //        User user = userRepository.getUserInfoByPhoneNumber(phoneNumber);
        Optional<User> user = userRepository.findByPhoneNumber(phoneNumber);
        return user;
    }

    public LoginDto autoLogin(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("sessionId".equals(cookie.getName())) {
                    cookie.setMaxAge(7 * 24 * 60 * 60);
                    response.addCookie(cookie);
                    break;
                }


            }
        }
        return null;
    }


    public void getUserInfoById(Integer userId) {
    }
}
