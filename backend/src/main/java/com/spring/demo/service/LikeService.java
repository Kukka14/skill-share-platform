package com.spring.demo.service;

import com.spring.demo.model.Like;
import com.spring.demo.model.Notification;
import com.spring.demo.model.User;
import com.spring.demo.repository.LikeRepository;
import com.spring.demo.repository.NotificationRepository;
import com.spring.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

//added by nethmi
import com.spring.demo.model.Post;      
import com.spring.demo.repository.PostRepository;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LikeService {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private UserRepository userRepository;
    
    //added by nethmi
    @Autowired
    private PostRepository postRepository;
    @Autowired
    private NotificationRepository notificationRepository;



    // Create a new like
    public Like createLike(String userId, String postId) {
        try {
            // Check if like already exists
            Optional<Like> existingLike = likeRepository.findByUserIdAndPostId(userId, postId);
            if (existingLike.isPresent()) {
                throw new IllegalArgumentException("User has already liked this post");
            }

            // Verify both user and post exist
            User likingUser = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
            
            Post likedPost = postRepository.findById(postId)
                    .orElseThrow(() -> new IllegalArgumentException("Post not found with ID: " + postId));

            // Create new like
            Like like = new Like();
            like.setUserId(userId);
            like.setPostId(postId);

            System.out.println("Saving like for user: " + userId + " on post: " + postId);
            Like savedLike = likeRepository.save(like);
            System.out.println("Like saved successfully with ID: " + savedLike.getId());

            // Only create notification if the post owner is not the one liking
            if (!userId.equals(likedPost.getUserId())) {
                try {
                    // Create the notification
                    Notification notification = new Notification();
                    notification.setUserId(likingUser.getId()); // who performed the action
                    notification.setUsername(likingUser.getUsername());
                    notification.setPostId(postId);
                    notification.setPostUserId(likedPost.getUserId()); // post owner's ID who will receive the notification
                    notification.setDescription(likingUser.getUsername() + " liked your post.");
                    notification.setRead(false);
                    notification.setTimestamp(LocalDateTime.now());
                    notification.setLikeId(savedLike.getId());

                    Notification savedNotification = notificationRepository.save(notification);
                    System.out.println("Notification saved successfully");
                } catch (Exception e) {
                    // Log error but don't fail the like operation if notification fails
                    System.err.println("Error creating notification for like: " + e.getMessage());
                    e.printStackTrace();
                }
            }

            return savedLike;
        } catch (IllegalArgumentException e) {
            // Re-throw these to be caught by the controller
            throw e;
        } catch (Exception e) {
            System.err.println("Unexpected error in createLike: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create like: " + e.getMessage(), e);
        }
    }

    // Remove a like
    public void removeLike(String userId, String postId) {
        Optional<Like> like = likeRepository.findByUserIdAndPostId(userId, postId);
        if (like.isPresent()) {
            likeRepository.delete(like.get());
        } else {
            throw new IllegalArgumentException("Like not found");
        }
    }

    // Get all likes for a post
    public List<Like> getLikesByPostId(String postId) {
        return likeRepository.findByPostId(postId);
    }

    // Get like count for a post
    public long getLikeCount(String postId) {
        return likeRepository.countByPostId(postId);
    }

    // Check if user has liked a post
    public boolean hasUserLikedPost(String userId, String postId) {
        return likeRepository.findByUserIdAndPostId(userId, postId).isPresent();
    }

    // Get all likes by a user
    public List<Like> getLikesByUser(String userId) {
        return likeRepository.findByUserId(userId);
    }

    // Get all likes
    public List<Like> getAllLikes() {
        return likeRepository.findAll();
    }
}