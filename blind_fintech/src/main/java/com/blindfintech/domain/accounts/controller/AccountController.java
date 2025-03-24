package com.blindfintech.domain.accounts.controller;

import com.blindfintech.common.dto.ResponseDto;
import com.blindfintech.domain.accounts.dto.AccountDetailsDto;
import com.blindfintech.domain.accounts.dto.AccountDetailsProjection;
import com.blindfintech.domain.accounts.dto.AccountListDto;
import com.blindfintech.domain.accounts.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;

    @GetMapping()
    public ResponseEntity<?> getAccounts() {
        AccountListDto accounts = accountService.getAccounts();
        return ResponseEntity.ok()
                .body(ResponseDto.success(accounts.getAccounts()));
    }

    @GetMapping("/{account_id}")
    public ResponseEntity<?> getAccountDetails(@PathVariable int account_id) {
        AccountDetailsDto accountDetails = accountService.getAccountDetails(account_id);
        return ResponseEntity.ok()
                .body(ResponseDto.success(accountDetails.getAccountDetails()));
    }
}
