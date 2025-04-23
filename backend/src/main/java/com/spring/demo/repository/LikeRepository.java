package com.spring.demo.repository;

import com.spring.demo.model.Like;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends MongoRepository<Like, String> {
    
    // Find all likes for a specific post
    List<Like> findByPostId(String postId);
    
    // Find all likes by a specific user
    List<Like> findByUserId(String userId);
    
    // Find a specific like by user and post
    Optional<Like> findByUserIdAndPostId(String userId, String postId);
    
    // Count likes for a specific post
    long countByPostId(String postId);
}
