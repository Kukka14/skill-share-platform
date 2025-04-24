package com.spring.demo.repository;

import com.spring.demo.model.Status;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface StatusRepository extends MongoRepository<Status, String> {
    List<Status> findByUserIdAndIsActiveTrue(String userId);
    List<Status> findByExpiresAtBeforeAndIsActiveTrue(LocalDateTime dateTime);
    List<Status> findByUserId(String userId);
    List<Status> findByIsActiveTrue();
}