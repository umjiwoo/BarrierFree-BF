package com.blindfintech.domain.users.service;

import com.blindfintech.domain.users.exception.UserException;
import com.blindfintech.domain.users.exception.UserExceptionCode;
import com.blindfintech.domain.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    //아이디 중복확인
    public void checkUserIdExists(String userId) {
        if (userRepository.existsById(userId)){
            throw new UserException(USER_ALREADY_EXISTS);
        }
    }


    // 회원가입


    //로그인


    //자동 로그인


    //유저 정보 불러오기

}
