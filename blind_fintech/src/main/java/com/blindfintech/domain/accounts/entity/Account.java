package com.blindfintech.domain.accounts.entity;

import com.blindfintech.domain.users.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "account")
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Builder.Default
    @Column(name = "bank_id", nullable = false)
    private Integer bankId = 999;

    @NotNull
    @Column(name = "account_no", nullable = false)
    private String accountNo;

    @Size(max = 30)
    @NotNull
    @Column(name = "username", nullable = false, length = 30)
    private String username;

    @NotNull
    @Builder.Default
    @Column(name = "account_balance", nullable = false)
    private Long accountBalance =0L;

    @NotNull
    @Builder.Default
    @Column(name = "daily_transfer_limit", nullable = false)
    private Integer dailyTransferLimit = 10000000;

    @NotNull
    @Builder.Default
    @Column(name = "one_time_transfer_limit", nullable = false)
    private Integer oneTimeTransferLimit = 5000000;

    @NotNull
    @Column(name = "account_password", nullable = false)
    private String accountPassword;

    @NotNull
    @CreatedDate
    @Builder.Default
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = ZonedDateTime.now(ZoneId.of("Asia/Seoul")).toLocalDateTime();

    @NotNull
    @Builder.Default
    @Column(name = "failed_attempts", nullable = false)
    private Integer failedAttempts = 0;

    @NotNull
    @Builder.Default
    @Lob
    @Column(name = "account_state", nullable = false)
    private String accountState = "ACTIVE";

    public int failedPassword() {
        return ++this.failedAttempts;
    }

    public void lockAccount() {
        this.accountState = "SUSPENDED";
    }

    public void unlockAccount() {
        this.accountState = "ACTIVE";
    }
}
