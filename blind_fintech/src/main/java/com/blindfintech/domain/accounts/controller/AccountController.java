package com.blindfintech.domain.accounts.controller;

import com.blindfintech.common.dto.ResponseDto;
import com.blindfintech.domain.accounts.dto.*;
import com.blindfintech.domain.accounts.service.AccountService;
import com.blindfintech.domain.users.dto.SmsDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
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

    @PostMapping("/create")
    public ResponseEntity<?> createAccount(@RequestBody AccountInputDto accountInputDto) {
        String accountNo = accountService.createAccount(accountInputDto);
        return ResponseEntity.ok()
                .body(ResponseDto.success(Map.of("accountNo", accountNo)));
    }

    @GetMapping("/{account_id}/account_state")
    public ResponseEntity<?> getAccountState(@PathVariable int account_id) {
        String accountState = accountService.getAccountState(account_id);
        return ResponseEntity.ok()
                .body(ResponseDto.success(accountState));
    }
/*    @GetMapping("/search-ai-accountTransction")
    public ResponseEntity<?> searchAiAccountTransction(@RequestParam Integer accountNo,
                                                       @RequestParam String reponse) {
        String aiResponsse = accountService.aiSearchAccountTransaction(accountNo, reponse);
        System.out.println(aiResponsse);
        return ResponseEntity.ok().body(aiResponsse);
    }*/

    @PostMapping("{account_id}/check-pwd")
    public ResponseEntity<?> checkPassword(@PathVariable int account_id, @RequestBody PasswordInputDto passwordInputDto) {
        log.info("account_id: {}", account_id);
        IsCorrectPwdDto isCorrect = accountService.validatePassword(account_id, passwordInputDto.getAccountPassword());
        return ResponseEntity.ok()
                .body(ResponseDto.success(isCorrect));
    }

    @PostMapping("{account_id}/unlock")
    public ResponseEntity<?> unlockAccount(@PathVariable int account_id, @RequestBody SmsDto smsDto) {
        accountService.unlockAccount(account_id, smsDto.getPhoneNumber(), smsDto.getVerificationCode());
        return ResponseEntity.ok(ResponseDto.success(null));
    }
}
