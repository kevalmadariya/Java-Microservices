package com.trade.user_authentication_microservice.service;

import com.trade.user_authentication_microservice.entity.AuthCredentials;
import com.trade.user_authentication_microservice.exception.BadRequestException;
import com.trade.user_authentication_microservice.repository.AuthCredentialsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthCredentialsService {

    private final AuthCredentialsRepository authCredentialsRepository;

    public AuthCredentials saveCredentials(AuthCredentials authCredentials) {
        log.info("Saving auth credentials for user ID: {}", authCredentials.getUser().getUserId());
        return authCredentialsRepository.save(authCredentials);
    }

    public Optional<AuthCredentials> getByUserId(String userId) {
        log.info("Fetching auth credentials for user ID: {}", userId);
        return authCredentialsRepository.findByUserUserId(userId);
    }

    public void updateLoginInfo(String authId, boolean success) {
        Optional<AuthCredentials> optional = authCredentialsRepository.findById(authId);
        if (optional.isPresent()) {
            AuthCredentials credentials = optional.get();
            credentials.setLastLogin(Instant.now());

            if (success) {
                credentials.setLoginAttempts(0);
                credentials.setLocked(false);
                log.info("Login successful: Resetting login attempts for auth ID: {}", authId);
            } else {
                credentials.setLoginAttempts(credentials.getLoginAttempts() + 1);
                log.warn("Login failed: Attempt {} for auth ID: {}", credentials.getLoginAttempts(), authId);

                if (credentials.getLoginAttempts() >= 5) {
                    credentials.setLocked(true);
                    log.error("Account locked due to too many failed attempts: auth ID: {}", authId);
                    throw new BadRequestException("Account locked due to too many failed attempts.");
                }
            }

            authCredentialsRepository.save(credentials);
        } else {
            log.warn("Auth credentials not found for ID: {}", authId);
        }
    }

    public boolean isAccountLocked(String authId) {
        return authCredentialsRepository.findById(authId)
                .map(AuthCredentials::isLocked)
                .orElse(false);
    }
}
