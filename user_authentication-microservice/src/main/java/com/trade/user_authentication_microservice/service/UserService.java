package com.trade.user_authentication_microservice.service;

import com.trade.user_authentication_microservice.entity.User;
import com.trade.user_authentication_microservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    public User createUser(User user) {
        log.info("Creating user with email: {}", user.getEmail());
        LocalDateTime now = LocalDateTime.now();

        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        User savedUser = userRepository.save(user);
        log.debug("User created: {}", savedUser);
        return savedUser;
    }

    public Optional<User> getUserById(String userId) {
        log.info("Fetching user by ID: {}", userId);
        return userRepository.findById(userId);
    }

    public Optional<User> getUserByEmail(String email) {
        log.info("Fetching user by email: {}", email);
        return userRepository.findByEmail(email);
    }

    public boolean existsByEmail(String email) {
        boolean exists = userRepository.existsByEmail(email);
        log.info("Checking existence by email '{}': {}", email, exists);
        return exists;
    }

    public boolean existsByUserId(String userId) {
        boolean exists = userRepository.existsByUserId(userId);
        log.info("Checking existence by user ID '{}': {}", userId, exists);
        return exists;
    }

    public List<User> getAllUsers() {
        log.info("Fetching all users");
        return userRepository.findAll();
    }

    public User updateUser(User user) {
        log.info("Updating user with ID: {}", user.getUserId());
        User updatedUser = userRepository.save(user);
        log.debug("User updated: {}", updatedUser);
        return updatedUser;
    }

    public void deleteUser(String userId) {
        log.warn("Deleting user with ID: {}", userId);
        userRepository.deleteById(userId);
    }
}
