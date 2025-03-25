package com.blindfintech.domain.accounts.controller;

import com.blindfintech.common.dto.ResponseDto;
import com.blindfintech.domain.accounts.dto.AccountDetailsDto;
import com.blindfintech.domain.accounts.dto.AccountDetailsProjection;
import com.blindfintech.domain.accounts.dto.AccountInputDto;
import com.blindfintech.domain.accounts.dto.AccountListDto;
import com.blindfintech.domain.accounts.entity.Account;
import com.blindfintech.domain.accounts.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;

    @GetMapping()
    public ResponseEntity<?> getAccounts() {
        AccountListDto accounts = accountService.getAccounts();
        return ResponseEntity.ok()
                .body(accounts.getAccounts());
    }

    @GetMapping("/{account_id}")
    public ResponseEntity<?> getAccountDetails(@PathVariable int account_id) {
        AccountDetailsDto accountDetails = accountService.getAccountDetails(account_id);
        return ResponseEntity.ok()
                .body(accountDetails.getAccountDetails());
    }

    @PostMapping("/create")
    public ResponseEntity<?> createAccount(@RequestBody AccountInputDto accountInputDto) {
        String accountNo = accountService.createAccount(accountInputDto);
        return ResponseEntity.ok()
                .body(Map.of("accountNo", accountNo));
    }

    @GetMapping("/{account_id}/is_locked")
    public ResponseEntity<?> getAccountState(@PathVariable int account_id) {
        String accountState = accountService.getAccountState(account_id);
        return ResponseEntity.ok()
                .body(accountState);
    }
}
