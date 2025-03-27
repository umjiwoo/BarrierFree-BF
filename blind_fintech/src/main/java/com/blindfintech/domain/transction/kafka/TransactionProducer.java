package com.blindfintech.domain.transction.kafka;

import com.blindfintech.domain.transction.dto.TransactionDto;
import com.blindfintech.domain.transction.entity.TransactionLog;
import com.blindfintech.domain.transction.entity.TransactionState;
import com.blindfintech.domain.transction.repository.AccountTransactionRepository;
import com.blindfintech.domain.transction.repository.TransactionLogRepository;
import com.blindfintech.domain.transction.service.TransactionLogDto;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.kafka.support.SendResult;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Slf4j
@AllArgsConstructor
@Component
public class TransactionProducer {
    private final TransactionLogRepository transactionLogRepository;
    private final KafkaTemplate<String, TransactionDto> kafkaTemplate;

    private static final int MAX_RETRY_COUNT = 3;

    public void sendTransaction(TransactionDto transactionDto) {
        sendWithRetry(transactionDto, 0);
    }

    private void sendWithRetry(TransactionDto transactionDto, int retryCount) {
        // Kafka에 메시지를 전송
        CompletableFuture<SendResult<String, TransactionDto>> future =
                kafkaTemplate.send("send_money", transactionDto);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("✅ Kafka 메시지 전송 성공\n topic={}, partition={}, offset={}, value={}",
                        result.getRecordMetadata().topic(),
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset(),
                        result.getProducerRecord().value());

                long offset = result.getRecordMetadata().offset();
                int partition = result.getRecordMetadata().partition();
                String transactionUuid = UUID.randomUUID().toString() + "-" + partition + "-" + offset;

                // 메시지 전송 성공 시 TransactionLog 데이터 생성 - pending 상태
                TransactionLog transactionLog = TransactionLog.from(
                        TransactionLogDto.from(transactionUuid, TransactionState.PENDING));
                transactionLogRepository.save(transactionLog);
            } else {
                if (retryCount < MAX_RETRY_COUNT) {
                    log.warn("⚠️ Kafka 메시지 전송 실패 (재시도 {}/{}): {}", retryCount + 1, MAX_RETRY_COUNT, transactionDto, ex);
                    try {
                        Thread.sleep(1000L); // 재시도 간격
                    } catch (InterruptedException ignored) {}

                    sendWithRetry(transactionDto, retryCount + 1); // 재귀적으로 재시도
                } else {
                    log.error("❌ Kafka 메시지 최종 실패 - DLQ로 전송: {}", transactionDto, ex);
                    //// 재시도 모두 실패 - Dead Letter Queue(DLQ)로 메시지 전송, DLQ 토픽 따로 생성 필요 ; 후순위
                    //kafkaTemplate.send("send_money_dlq", transactionDto);
                    //log.error("❌ Kafka 메시지 전송 최종 실패 (DLQ로 전송): {}", transactionDto);
                }
            }
        });
    }
}
