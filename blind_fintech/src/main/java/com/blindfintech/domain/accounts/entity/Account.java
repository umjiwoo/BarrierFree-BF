package com.blindfintech.domain.accounts.entity;

import com.blindfintech.domain.users.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "account")
public class Account {
    @Id
    @Column(name = "account_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @Column(name = "bank_id", nullable = false)
    private Integer bankId;

    @Size(max = 255)
    @NotNull
    @Column(name = "account_no", nullable = false)
    private String accountNo;

    @Size(max = 30)
    @NotNull
    @Column(name = "username", nullable = false, length = 30)
    private String username;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "account_balance", nullable = false)
    private Long accountBalance;

    @NotNull
    @ColumnDefault("10000000")
    @Column(name = "daily_transfer_limit", nullable = false)
    private Integer dailyTransferLimit;

    @NotNull
    @ColumnDefault("5000000")
    @Column(name = "one_time_transfer_limit", nullable = false)
    private Integer oneTimeTransferLimit;

    @Size(max = 30)
    @NotNull
    @Column(name = "account_password", nullable = false, length = 30)
    private String accountPassword;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "failed_attempts", nullable = false)
    private Integer failedAttempts;

    @NotNull
    @ColumnDefault("'ACTIVE'")
    @Lob
    @Column(name = "account_state", nullable = false)
    private String accountState;

}