package com.blindfintech.domain.accounts.controller;

import com.blindfintech.common.dto.ResponseDto;
import com.blindfintech.domain.accounts.dto.AccountListDto;
import com.blindfintech.domain.accounts.service.AccountService;
import com.blindfintech.domain.users.entity.User;
import com.blindfintech.domain.users.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;
    private final UserService userService;

    @GetMapping()
    public ResponseEntity<?> getAccounts() {
        User user = userService.getCurrentUser();
        AccountListDto accounts = accountService.getAccounts(user);
        return ResponseEntity.ok()
                .body(ResponseDto.success(accounts));
    }
}
