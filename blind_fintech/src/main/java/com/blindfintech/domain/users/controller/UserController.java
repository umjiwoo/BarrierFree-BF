package com.blindfintech.domain.users.controller;

import com.blindfintech.domain.users.dto.UserDto;
import com.blindfintech.domain.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    @GetMapping("/check-id")
    public String checkId(@RequestParam(name = "userLoginId") String id) {
        userService.checkUserIdExists(id);
        return "OK";
    }

    @PostMapping("/sign-up")
    public ResponseEntity<Void> signUp(@RequestBody UserDto userDto) {
        userService.signUp(userDto);
        return ResponseEntity.ok().build();
    }




}
