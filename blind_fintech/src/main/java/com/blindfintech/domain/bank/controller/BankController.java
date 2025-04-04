package com.blindfintech.domain.bank.controller;

import com.blindfintech.common.dto.ResponseDto;
import com.blindfintech.domain.bank.dto.BankDto;
import com.blindfintech.domain.bank.service.BankService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/bank")
public class BankController {
    private final BankService bankService;

    @GetMapping("/infos")
    public ResponseEntity<ResponseDto<List<BankDto>>> getBankInfos() {
        List<BankDto> bankList = bankService.getAllBanks();
        return ResponseEntity.ok(ResponseDto.success(200,"은행 정보 로드 성공 ",bankList));

    }
}
