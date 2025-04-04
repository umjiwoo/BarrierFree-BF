package com.blindfintech.domain.transction.controller;

import com.blindfintech.common.dto.ResponseDto;
import com.blindfintech.domain.accounts.repository.AccountRepository;
import com.blindfintech.domain.transction.dto.*;
import com.blindfintech.domain.transction.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/transactions")
public class TransactionController {
    private final TransactionService transactionService;
    private final AccountRepository accountRepository;

    @GetMapping("/check-account")
    public ResponseEntity<ResponseDto<CheckAccountResultDto>> checkAccount(
            @RequestBody CheckAccountRequestDto accountInfo) {
        CheckAccountResultDto checkAccountResultDto= transactionService.checkAccount(accountInfo);
        return ResponseEntity.ok().body(ResponseDto.success(checkAccountResultDto));
    }

    @PostMapping("/send-money")
    public ResponseEntity<?> sendMoney(
            @RequestBody TransactionRequestDto transactionRequestDto){

        transactionService.produceSendMoney(transactionRequestDto);
        return ResponseEntity.ok().body("ok");
    }

    @GetMapping("/history")
    public ResponseEntity<ResponseDto<List<RecentTransactionAccountDto>>> getTransactionHistory(){
        List<RecentTransactionAccountDto> recentTransactionAccounts = transactionService.getRecentTransactionAccounts();
        return ResponseEntity.ok(ResponseDto.success(recentTransactionAccounts));
    }
}
