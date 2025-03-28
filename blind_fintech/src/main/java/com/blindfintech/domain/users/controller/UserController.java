package com.blindfintech.domain.users.controller;

import com.blindfintech.common.dto.ResponseDto;
import com.blindfintech.domain.users.dto.LoginDto;
import com.blindfintech.domain.users.dto.UserDto;
import com.blindfintech.domain.users.entity.User;
import com.blindfintech.domain.users.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
    public ResponseEntity<ResponseDto<Void>> checkId(@RequestParam(name = "userLoginId") String phoneNumber) {

            userService.checkUserIdExists(phoneNumber);
            return ResponseEntity.ok(ResponseDto.success(200, "사용가능한 ID입니다."));
    }

    @PostMapping("/sign-up")
    public ResponseEntity<?> signUp(@RequestBody UserDto userDto) {
        userService.signUp(userDto);
        return ResponseEntity.ok(ResponseDto.success(200, "회원가입 성공"));
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseDto<User>> login(@RequestBody LoginDto loginDto,
                                                   @RequestParam(required = false, defaultValue = "false") boolean isAutoLogin,
                                                   HttpServletResponse response) {
        System.out.println("login: " + loginDto);
        User user = userService.login(loginDto, isAutoLogin, response);
        return ResponseEntity.ok(ResponseDto.success(200,"로그인 성공 ",user));
    }


    @GetMapping("auto-login")
    public ResponseEntity<ResponseDto<Void>> autoLogin(HttpServletResponse response, HttpServletRequest request) {
        userService.autoLogin(request, response);
        return ResponseEntity.ok(ResponseDto.success(200,"자동 로그인 성공"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ResponseDto<Void>> logout(HttpServletResponse response) {
        userService.deleteCookies(response);
        return ResponseEntity.ok(ResponseDto.success(200, "로그아웃 성공"));
    }

//    @GetMapping("/infos/{userId}")
//    public ResponseEntity<ResponseDto<Void>>  infos(@PathVariable("userId") Integer userId) {
//        userService.getUserInfoById(userId);
//        return ResponseEntity.ok(ResponseDto.success(200, "유저 정보 갖고오기"));
//    }
}
