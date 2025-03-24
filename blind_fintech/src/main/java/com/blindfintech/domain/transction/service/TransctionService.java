package com.blindfintech.domain.transction.service;

import com.blindfintech.domain.transction.controller.TransactionRequest;
import com.blindfintech.domain.transction.dto.TransactionResultDTO;
import com.blindfintech.domain.transction.repository.TransctionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class TransctionService {
    private final TransctionRepository transctionRepository;

    public TransactionResultDTO sendMoney(TransactionRequest transactionRequest){
        // 메시지 처리
        // TransactionLog 땡기기

        // AccountTransaction 생성

        // TransactionHistory 생성

        return new TransactionResultDTO();
    }
}
