package com.blindfintech.domain.users.converter;

import com.blindfintech.domain.users.dto.UserDto;
import com.blindfintech.domain.users.entity.User;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class UserConverter {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public static User dtoToEntity(UserDto userDto, String encryptedPassword) {
        return new User(
                userDto.getLoginId(),
                encryptedPassword,
                userDto.getUserName(),
                LocalDate.parse(userDto.getBirthDate(), DATE_FORMATTER),
                userDto.getPhoneNumber(),
                userDto.getJoinedDate()
        );
    }

}
