package com.blindfintech.domain.users.controller;

import com.blindfintech.domain.users.dto.LoginDto;
import com.blindfintech.domain.users.dto.UserDto;
import com.blindfintech.domain.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    @GetMapping("/check-id")
    public ResponseEntity<String> checkId(@RequestParam(name = "userLoginId") String id) {
        try {
            userService.checkUserIdExists(id);
            return ResponseEntity.ok("사용 가능한 ID");  // ID가 존재하지 않으면 사용 가능하다는 메시지
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("중복된 ID입니다.");  // ID가 이미 존재할 경우
        }
    }


    @PostMapping("/sign-up")
    public ResponseEntity<String> signUp(@RequestBody UserDto userDto) {
        System.out.println("signUp: " + userDto);
        System.out.println(userDto);
        userService.signUp(userDto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginDto loginDto) {
        System.out.println("login: " + loginDto);
        return ResponseEntity.ok().build();
    }




}
