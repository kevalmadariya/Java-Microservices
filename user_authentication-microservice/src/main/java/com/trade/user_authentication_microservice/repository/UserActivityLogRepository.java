package com.trade.user_authentication_microservice.repository;

import com.trade.user_authentication_microservice.entity.UserActivityLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface UserActivityLogRepository extends MongoRepository<UserActivityLog, String> {
    List<UserActivityLog> findByUserUserId(String userId);
}
