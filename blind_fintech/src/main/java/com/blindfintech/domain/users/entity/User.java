package com.blindfintech.domain.users.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 자동 증가
    @Column(name = "user_id", nullable = false)
    private Integer uid;

    @Size(max = 255)
    @NotNull
    @Column(name = "password", nullable = false)
    private String password;

    @Size(max = 10)
    @NotNull
    @Column(name = "user_name", nullable = false, length = 10)
    private String userName;

    @NotNull
    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Size(max = 11)
    @NotNull
    @Column(name = "phone_number", nullable = false, length = 11)
    private String phoneNumber;

    @NotNull
    @Column(name = "joined_date", nullable = false)
    private LocalDateTime joinedDate = ZonedDateTime.now(ZoneId.of("Asia/Seoul")).toLocalDateTime();

    public User(String password, String userName, LocalDate birthDate, String phoneNumber, LocalDateTime joinedDate) {
        this.password = password;
        this.userName = userName;
        this.birthDate = birthDate;
        this.phoneNumber = phoneNumber;
        this.joinedDate = joinedDate;
    }

}