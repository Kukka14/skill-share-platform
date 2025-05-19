package com.spring.demo.repository;

import com.spring.demo.model.Follow;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends MongoRepository<Follow, String> {
    
    // Find a specific follow relationship
    Optional<Follow> findByFollowerIdAndFollowedId(String followerId, String followedId);
    
    // Find all users that a user is following
    List<Follow> findByFollowerId(String followerId);
    
    // Find all followers of a user
    List<Follow> findByFollowedId(String followedId);
    
    // Count how many users a user is following
    long countByFollowerId(String followerId);
    
    // Count how many followers a user has
    long countByFollowedId(String followedId);
    
    // Delete a follow relationship
    void deleteByFollowerIdAndFollowedId(String followerId, String followedId);
}
