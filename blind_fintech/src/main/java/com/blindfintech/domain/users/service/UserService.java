package com.blindfintech.domain.users.service;

import com.blindfintech.common.exception.BadRequestException;
import com.blindfintech.domain.users.converter.UserConverter;
import com.blindfintech.domain.users.dto.UserDto;
import com.blindfintech.domain.users.entity.User;
import com.blindfintech.domain.users.exception.UserExceptionCode;
import com.blindfintech.domain.users.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // 아이디 중복 확인 - 유저 휴대폰 번호 기준으로
    public void checkUserIdExists(String phoneNumber) {
        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new BadRequestException(UserExceptionCode.USER_ALREADY_EXISTS);
        }
    }

    // 회원가입
    public void signUp(UserDto userDto) {

    }

    // 로그인 - ID로 유저 찾기
    public Optional<User> getUserByLoginId(String loginId) {
        return userRepository.findById(loginId);
    }

    public void deleteCookies(HttpServletResponse response) {
    }

    public void getUserInfo(HttpServletResponse response) {
    }

    public void getUserInfoById(Integer userId) {
    }
}
