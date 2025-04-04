package com.blindfintech.common.repository;

import com.blindfintech.common.entity.Fcm;
import com.blindfintech.domain.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FcmRepository extends JpaRepository<Fcm, Integer> {
    Optional<Fcm> findByUser(User user);
}