package com.blindfintech.common.bank.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "bank")
public class Bank {
    @Id
    @Column(name = "bank_id", nullable = false)
    private Integer id;

    @Size(max = 30)
    @NotNull
    @Column(name = "bank_name", nullable = false, length = 30)
    private String bankName;

    @Size(max = 255)
    @NotNull
    @Column(name = "bank_code", nullable = false)
    private String bankCode;
}