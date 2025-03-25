package com.blindfintech.domain.users.service;

import com.blindfintech.common.exception.BadRequestException;
import com.blindfintech.domain.users.converter.UserConverter;
import com.blindfintech.domain.users.dto.UserDto;
import com.blindfintech.domain.users.entity.User;
import com.blindfintech.domain.users.exception.UserExceptionCode;
import com.blindfintech.domain.users.repository.UserRepository;
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

    // 아이디 중복 확인
    public void checkUserIdExists(String id) {
        if (userRepository.existsById(id)) {
            throw new BadRequestException(UserExceptionCode.USER_ALREADY_EXISTS);
        }
    }
    // 회원가입
    public void signUp(UserDto userDto) {
        log.info("회원가입 요청: {}", userDto);

        //BCrypt의 `gensalt()`를 사용하여 안전한 salt 생성
        String hashedPassword = BCrypt.hashpw(userDto.getPassword(), BCrypt.gensalt());

        // 해시된 비밀번호 전달하여 중복 코드 제거
        User user = UserConverter.dtoToEntity(userDto, hashedPassword);

        log.info("저장할 유저 정보: {}", user);
        userRepository.save(user);
    }

    // 로그인 - ID로 유저 찾기
    public Optional<User> getUserByLoginId(String loginId) {
        return userRepository.findById(loginId);
    }
}
