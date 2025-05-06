package com.trade.user_authentication_microservice.service;

import com.trade.user_authentication_microservice.entity.UserActivityLog;
import com.trade.user_authentication_microservice.repository.UserActivityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserActivityLogService {

    private final UserActivityLogRepository userActivityLogRepository;

    public UserActivityLog logActivity(UserActivityLog activityLog) {
        log.info("Logging user activity: {} for user ID: {}", activityLog.getActivityType(), activityLog.getUser().getUserId());
        return userActivityLogRepository.save(activityLog);
    }

    public List<UserActivityLog> getLogsByUserId(String userId) {
        log.info("Fetching activity logs for user ID: {}", userId);
        return userActivityLogRepository.findByUserUserId(userId);
    }

    public List<UserActivityLog> getAllLogs() {
        return userActivityLogRepository.findAll();
    }
}
