package com.blindfintech.domain.users.controller;

import com.blindfintech.domain.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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



}
