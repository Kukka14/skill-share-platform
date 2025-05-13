package com.spring.demo.repository;

import com.spring.demo.model.LearningPlan;
import com.spring.demo.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LearningPlanRepository extends MongoRepository<LearningPlan, String> {
    List<LearningPlan> findByCreator(User creator);
    List<LearningPlan> findByIsPublicTrue();
    List<LearningPlan> findByCreatorAndIsPublic(User creator, boolean isPublic);
    List<LearningPlan> findByCreatorId(String creatorId);
} 