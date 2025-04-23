package com.spring.demo.repository;

import com.spring.demo.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    
    // Find all comments for a specific post
    List<Comment> findByPostId(String postId);
    
    // Find all comments by a specific user
    List<Comment> findByUserId(String userId);
    
    // Find comments by content containing keyword
    List<Comment> findByContentContaining(String keyword);
    
    // Find comments by post ID, sorted by creation date
    List<Comment> findByPostIdOrderByCreatedAtDesc(String postId);
    
    // Count comments for a specific post
    long countByPostId(String postId);
    
    // Delete all comments for a specific post
    void deleteByPostId(String postId);
    
    // Find comments created between two dates
    List<Comment> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
