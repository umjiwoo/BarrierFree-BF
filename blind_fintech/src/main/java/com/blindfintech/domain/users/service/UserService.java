package com.blindfintech.domain.users.service;

import com.blindfintech.common.exception.BadRequestException;
import com.blindfintech.domain.users.dto.UserDto;
import com.blindfintech.domain.users.entity.User;
import com.blindfintech.domain.users.exception.UserExceptionCode;
import com.blindfintech.domain.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    //아이디 중복확인
    public void checkUserIdExists(String id) {
        if (userRepository.existsById(id)){
            throw new BadRequestException(UserExceptionCode.USER_ALREADY_EXISTS);
        }
    }

    // 회원가입
    public void signUp(UserDto userDto) {
        String randomSalt = generateSalt();
        String pwd = userDto.getPassword();
        String hashedPassword = BCrypt.hashpw(userDto.getPassword(), randomSalt);

        User user = new User();
        user.setPassword(hashedPassword);
        userRepository.save(user);

    }

    private String generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }


    //로그인


    //자동 로그인

    //유저 정보 불러오기

}
