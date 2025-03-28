package com.blindfintech.domain.transction.controller;

import com.blindfintech.domain.transction.controller.request.CheckAccountRequest;
import com.blindfintech.domain.transction.controller.request.TransactionRequest;
import com.blindfintech.domain.transction.dto.CheckAccountResultDto;
import com.blindfintech.domain.transction.dto.TransactionResultDto;
import com.blindfintech.domain.transction.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/accounts/transaction")
public class TransactionController {
    private final TransactionService transactionService;

    @GetMapping("/check_account")
    public ResponseEntity<CheckAccountResultDto> checkAccount(
            @RequestBody CheckAccountRequest accountInfo) {
        return ResponseEntity.ok().body(transactionService.checkAccount(accountInfo)); // 계좌주 이름 반환
    }

    @PostMapping("/send_money")
    public ResponseEntity<?> sendMoney(
            @RequestBody TransactionRequest transactionRequest){

        transactionService.produceSendMoney(transactionRequest);
        return ResponseEntity.ok().body("ok");
    }
}
