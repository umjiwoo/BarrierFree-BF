package com.blindfintech.domain.bank.service;

import com.blindfintech.domain.bank.dto.BankDto;
import com.blindfintech.domain.bank.entity.Bank;
import com.blindfintech.domain.bank.Repository.BankRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class BankService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final BankRepository bankRepository;

    public List<BankDto> getAllBanks() {
        // Redis에서 은행 목록 확인
        List<Object> cachedBanks = redisTemplate.opsForHash().values("bank_codes");
        if (!cachedBanks.isEmpty()) {
            return cachedBanks.stream()
                    .map(obj -> (BankDto) obj)  // Redis에서 가져온 Object를 BankDto로 변환
                    .collect(Collectors.toList());
        }

        // Redis에 없으면 DB에서 조회
        List<Bank> bankList = bankRepository.findAll();
        System.out.println("bankList: " + bankList);
        List<BankDto> bankDtoList = bankList.stream()
                .map(bank -> new BankDto(bank.getBankCode(), bank.getBankName()))
                .collect(Collectors.toList());

        //  조회한 데이터를 Redis에 저장
        for (BankDto bankDto : bankDtoList) {
            redisTemplate.opsForHash().put("bank_codes", bankDto.getBankCode(), bankDto);
        }

        return bankDtoList;
    }
}