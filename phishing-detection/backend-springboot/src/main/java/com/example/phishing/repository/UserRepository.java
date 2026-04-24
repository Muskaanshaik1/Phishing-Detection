
package com.example.phishing.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.phishing.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

}


