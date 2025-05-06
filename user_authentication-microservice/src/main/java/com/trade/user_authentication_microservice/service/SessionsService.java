package com.trade.user_authentication_microservice.service;

import com.trade.user_authentication_microservice.entity.Sessions;
import com.trade.user_authentication_microservice.repository.SessionsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionsService {

    private final SessionsRepository sessionsRepository;

    public Sessions createSession(Sessions session) {
        log.info("Creating session for user ID: {}", session.getUser().getUserId());
        return sessionsRepository.save(session);
    }

    public Optional<Sessions> getSessionById(String sessionId) {
        log.info("Fetching session by ID: {}", sessionId);
        return sessionsRepository.findById(sessionId);
    }

    public List<Sessions> getSessionsByUser(String userId) {
        log.info("Fetching sessions for user ID: {}", userId);
        return sessionsRepository.findByUserUserId(userId);
    }

    public void deleteSession(String sessionId) {
        log.info("Deleting session ID: {}", sessionId);
        sessionsRepository.deleteById(sessionId);
    }

    public void deleteSessionsByUser(String userId) {
        log.info("Deleting all sessions for user ID: {}", userId);
        sessionsRepository.deleteAll(sessionsRepository.findByUserUserId(userId));
    }
}
