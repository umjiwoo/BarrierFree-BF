package com.blindfintech.domain.users.repository;

import com.blindfintech.domain.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface  UserRepository extends JpaRepository<User, Integer> {

    Optional<User> findByPhoneNumber(String phoneNumber);
    boolean existsById(String id);

    Optional<User> findById(String id);

}
