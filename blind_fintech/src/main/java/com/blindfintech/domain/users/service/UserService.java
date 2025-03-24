package com.blindfintech.domain.users.service;

import com.blindfintech.domain.users.entity.User;
import com.blindfintech.domain.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public Optional<User> getCurrentUser() {
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        User user = (User) authentication.getPrincipal();
        Optional<User> user = userRepository.findById(1);
        return user;
    }
}
