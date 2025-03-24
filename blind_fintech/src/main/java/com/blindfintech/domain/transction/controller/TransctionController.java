package com.blindfintech.domain.transction.controller;

import com.blindfintech.domain.transction.dto.TransactionResultDTO;
import com.blindfintech.domain.transction.service.TransctionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/accounts/")
public class TransctionController {
    private final TransctionService transactionService;

    @PostMapping("send_money/")
    public ResponseEntity<TransactionResultDTO> sendMoney(
            @RequestBody TransactionRequest transactionRequest){
        TransactionResultDTO result = transactionService.sendMoney(transactionRequest);

        return ResponseEntity.ok(new TransactionResultDTO());
    }
}
