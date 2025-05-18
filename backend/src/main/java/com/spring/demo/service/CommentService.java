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
        try {
            // Input validation
            if (content == null || content.trim().isEmpty()) {
                throw new IllegalArgumentException("Comment content cannot be empty");
            }

            // Verify the user exists
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

            // Verify the post exists
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new IllegalArgumentException("Post not found with ID: " + postId));

            System.out.println("Creating comment with content: " + content);
            System.out.println("For user: " + userId + " on post: " + postId);

            Comment comment = new Comment();
            comment.setUser(user);
            comment.setPostId(postId);
            comment.setContent(content.trim());
            // Using java.time.Instant directly to avoid timezone issues
            comment.setCreatedAt(System.currentTimeMillis());
            comment.setUpdatedAt(System.currentTimeMillis());
            
            System.out.println("Saving comment to database");
            Comment savedComment = commentRepository.save(comment);
            System.out.println("Comment saved with ID: " + savedComment.getId());

            // Only create notification if the comment author is not the post owner
            if (!userId.equals(post.getUserId())) {
                try {
                    // Create the notification
                    Notification notification = new Notification();
                    notification.setUserId(user.getId()); // who commented
                    notification.setUsername(user.getUsername());
                    notification.setPostId(postId);
                    notification.setPostUserId(post.getUserId()); // post owner who receives the notification
                    notification.setDescription(user.getUsername() + " commented on your post.");
                    notification.setRead(false);
                    notification.setTimestamp(LocalDateTime.now());

                    System.out.println("Saving notification for comment");
                    Notification savedNotification = notificationRepository.save(notification);
                    System.out.println("Notification saved successfully");
                } catch (Exception e) {
                    // Log error but don't fail the comment operation if notification fails
                    System.err.println("Error creating notification for comment: " + e.getMessage());
                    e.printStackTrace();
                }
            }

            return savedComment;
        } catch (IllegalArgumentException e) {
            // Re-throw these to be caught by the controller
            throw e;
        } catch (Exception e) {
            System.err.println("Unexpected error in createComment: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create comment: " + e.getMessage(), e);
        }
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
