package com.blindfintech.domain.transction.kafka;

import com.blindfintech.domain.transction.dto.TransactionRequestDto;
import com.blindfintech.domain.transction.entity.TransactionLog;
import com.blindfintech.domain.transction.entity.TransactionState;
import com.blindfintech.domain.transction.repository.TransactionLogRepository;
import com.blindfintech.domain.transction.dto.TransactionLogDto;
import com.blindfintech.domain.transction.service.TransactionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.context.annotation.Lazy;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@AllArgsConstructor
@Component
public class TransactionConsumer {
    @Lazy
    private final TransactionService transactionService;
    private final ObjectMapper objectMapper;
    private final TransactionLogRepository transactionLogRepository;

    @KafkaListener(topics = "send_money", groupId = "blind-fintech-group", concurrency = "2")
    public void listen(ConsumerRecord<String, String> record) {
        try {
            log.info("📥 Received DTO: {}", record);

            String transactionJson = record.value();
            log.info("📜 Extracted JSON: : {}", transactionJson);

            TransactionRequestDto transactionRequestDto = objectMapper.readValue(transactionJson, TransactionRequestDto.class);

            long offset = record.offset();
            int partition = record.partition();
            String transactionUuid = "send_money" + "-" + partition + "-" + offset;

            TransactionLog transactionLog = TransactionLog.from(
                    TransactionLogDto.from(transactionUuid, TransactionState.PROCESSING));
            transactionLogRepository.save(transactionLog);

            transactionService.consumeSendMoney(transactionRequestDto, transactionUuid);
        } catch (Exception e) {
            System.err.println("❌ JSON 변환 실패: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }
}
