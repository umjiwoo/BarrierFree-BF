package com.blindfintech.domain.transction.exception;

import com.blindfintech.common.exception.ExceptionCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum TransactionExceptionCode implements ExceptionCode {
    ACCOUNT_NOT_FOUND(3000, "해당 번호의 계좌가 존재하지 않습니다."),
    INSUFFICIENT_BALANCE(3001,"계좌 잔액을 확인해주세요."),
    INVALID_BANK_CODE(3002, "유효하지 않은 은행 코드입니다."),
    WRONG_BANK_CODE(3003, "계좌 정보와 은행 코드가 일치하지 않습니다."),
    OVER_ONETIME_TRANSFER_LIMIT(3004, "1회 이체한도를 초과했습니다."),
    OVER_DAILY_TRANSFER_LIMIT(3004, "1일 이체한도를 초과했습니다."),
    SEND_MONEY_FAILED(3010, "송금 실패"),
    PAY_MONEY_FAILED(3011, "결제 실패"),
    SOCKET_RESPONSE_FAILED(3100, "웹소켓 응답 실패");

    private final int code;
    private final String message;
}
