package com.spring.demo.service;

import com.spring.demo.model.Comment;
import com.spring.demo.model.User;
import com.spring.demo.repository.CommentRepository;
import com.spring.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CommentService {
    
    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    // Create a new comment
    public Comment createComment(String userId, String postId, String content) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = new Comment();
        comment.setUser(user);
        comment.setPostId(postId);
        comment.setContent(content);
        
        return commentRepository.save(comment);
    }

    // Update an existing comment
    public Comment updateComment(String commentId, String content) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        comment.setContent(content);
        comment.setUpdatedAt(LocalDateTime.now());
        
        return commentRepository.save(comment);
    }

    // Delete a comment
    public void deleteComment(String commentId) {
        commentRepository.deleteById(commentId);
    }

    // Get all comments for a post
    public List<Comment> getCommentsByPostId(String postId) {
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId);
    }

    // Get all comments by a user
    public List<Comment> getCommentsByUser(String userId) {
        return commentRepository.findByUserId(userId);
    }

    // Search comments by keyword
    public List<Comment> searchComments(String keyword) {
        return commentRepository.findByContentContaining(keyword);
    }

    // Get comment count for a post
    public long getCommentCount(String postId) {
        return commentRepository.countByPostId(postId);
    }

    // Get comments within a date range
    public List<Comment> getCommentsByDateRange(LocalDateTime start, LocalDateTime end) {
        return commentRepository.findByCreatedAtBetween(start, end);
    }

    // Get a single comment by ID
    public Optional<Comment> getCommentById(String commentId) {
        return commentRepository.findById(commentId);
    }

    // Delete all comments for a post
    public void deleteAllCommentsForPost(String postId) {
        commentRepository.deleteByPostId(postId);
    }
}
