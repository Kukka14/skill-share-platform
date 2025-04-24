package com.spring.demo.service;

import com.spring.demo.model.Comment;
import com.spring.demo.model.User;
import com.spring.demo.repository.CommentRepository;
import com.spring.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

//added by nethmi
import com.spring.demo.model.Notification;
import com.spring.demo.model.Post;
import com.spring.demo.repository.NotificationRepository;
import com.spring.demo.repository.PostRepository;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CommentService {
    
    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;
    
    //added by nethmi
    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PostRepository postRepository;


    // Create a new comment
    public Comment createComment(String userId, String postId, String content) {
        // Input validation
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Comment content cannot be empty");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = new Comment();
        comment.setUser(user);
        comment.setPostId(postId);
        comment.setContent(content.trim());
        comment.setCreatedAt(LocalDateTime.now().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli());
        comment.setUpdatedAt(LocalDateTime.now().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli());
        
        //added by nethmi
        Comment savedComment = commentRepository.save(comment);

        // Fetch the post to get the owner's userId
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Create the notification
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setUsername(user.getUsername());
        notification.setPostId(postId);
        notification.setPostUserId(post.getUserId());
        notification.setDescription(user.getUsername() + " commented on a post.");
        notification.setRead(false);
        notification.setTimestamp(LocalDateTime.now());

        // Save to notifications collection
        notificationRepository.save(notification);

        return savedComment;
        
        //return commentRepository.save(comment);

    }

    // Update an existing comment
    public Comment updateComment(String commentId, String content) {
        // Input validation
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Comment content cannot be empty");
        }

        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        comment.setContent(content.trim());
        comment.setUpdatedAt(LocalDateTime.now().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli());
        
        return commentRepository.save(comment);
    }

    // Delete a comment
    public void deleteComment(String commentId) {
        if (!commentRepository.existsById(commentId)) {
            throw new IllegalArgumentException("Comment not found");
        }
        commentRepository.deleteById(commentId);
    }

    // Get all comments for a post
    public List<Comment> getCommentsByPostId(String postId) {
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId);
    }

    // Change method name from getCommentsByUser to getCommentsByUserId
    public List<Comment> getCommentsByUserId(String userId) {
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
