package com.blindfintech.domain.users.repository;

import com.blindfintech.domain.users.entity.User;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface  UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByPhoneNumber(String phoneNumber);
    boolean existsByPhoneNumber(String phoneNumber);
    User getUserInfoByPhoneNumber(@Size(max = 11) @NotNull String phoneNumber);
      Optional<User> findById(Long id);
}
