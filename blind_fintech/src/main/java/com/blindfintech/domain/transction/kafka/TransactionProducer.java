package com.blindfintech.domain.transction.kafka;

import com.blindfintech.domain.transction.dto.TransactionRequestDto;
import com.blindfintech.domain.transction.entity.TransactionLog;
import com.blindfintech.domain.transction.entity.TransactionState;
import com.blindfintech.domain.transction.repository.TransactionLogRepository;
import com.blindfintech.domain.transction.service.TransactionLogDto;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.kafka.support.SendResult;

import java.util.concurrent.CompletableFuture;

@Slf4j
@AllArgsConstructor
@Component
public class TransactionProducer {
    private final TransactionLogRepository transactionLogRepository;
    private final KafkaTemplate<String, TransactionRequestDto> kafkaTemplate;

    private static final int MAX_RETRY_COUNT = 3;

    public void sendTransaction(TransactionRequestDto transactionRequestDto) {
        sendWithRetry(transactionRequestDto, 0);
    }

    private void sendWithRetry(TransactionRequestDto transactionRequestDto, int retryCount) {
        // Kafka에 메시지를 전송
        CompletableFuture<SendResult<String, TransactionRequestDto>> future =
                kafkaTemplate.send("send_money", transactionRequestDto);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("✅ Kafka 메시지 전송 성공\n topic={}, partition={}, offset={}, value={}",
                        result.getRecordMetadata().topic(),
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset(),
                        result.getProducerRecord().value());

                long offset = result.getRecordMetadata().offset();
                int partition = result.getRecordMetadata().partition();
                String transactionUuid = "send_money" + "-" + partition + "-" + offset;

                // 메시지 전송 성공 시 TransactionLog 데이터 생성 - pending 상태
                TransactionLog transactionLog = TransactionLog.from(
                        TransactionLogDto.from(transactionUuid, TransactionState.PENDING));
                transactionLogRepository.save(transactionLog);
            } else {
                if (retryCount < MAX_RETRY_COUNT) {
                    log.warn("⚠️ Kafka 메시지 전송 실패 (재시도 {}/{}): {}", retryCount + 1, MAX_RETRY_COUNT, transactionRequestDto, ex);
                    try {
                        Thread.sleep(1000L); // 재시도 간격
                    } catch (InterruptedException ignored) {}

                    sendWithRetry(transactionRequestDto, retryCount + 1); // 재귀적으로 재시도
                } else {
                    log.error("❌ Kafka 메시지 최종 실패 - DLQ로 전송: {}", transactionRequestDto, ex);
                    //// 재시도 모두 실패 - Dead Letter Queue(DLQ)로 메시지 전송, DLQ 토픽 따로 생성 필요 ; 후순위
                    //kafkaTemplate.send("send_money_dlq", transactionDto);
                    //log.error("❌ Kafka 메시지 전송 최종 실패 (DLQ로 전송): {}", transactionDto);
                }
            }
        });
    }
}
