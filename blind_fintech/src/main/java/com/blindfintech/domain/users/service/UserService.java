package com.blindfintech.domain.users.service;

import com.blindfintech.common.exception.BadRequestException;
import com.blindfintech.domain.users.converter.UserConverter;
import com.blindfintech.domain.users.dto.LoginDto;
import com.blindfintech.domain.users.dto.UserDto;
import com.blindfintech.domain.users.entity.User;
import com.blindfintech.domain.users.exception.UserStatusCode;
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
            throw new BadRequestException(UserStatusCode.USER_ALREADY_EXISTS);
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

    public void login(LoginDto loginDto) {
        String phoneNumber = loginDto.getPhoneNumber();
        String password = loginDto.getPassword();
        Optional<User> user = userRepository.findByPhoneNumber(phoneNumber);

        if (user.isPresent()) {
            if (BCrypt.checkpw(password, user.get().getPassword())) {

            }
        }
    }
    private User authenticate(LoginDto loginDto) {
        String phoneNumber = loginDto.getPhoneNumber();
        String password = loginDto.getPassword();
        if (!userRepository.existsByPhoneNumber(phoneNumber)){
            throw new UserStatusCode.USER_LOGIN_MISMATCH);

        }
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
