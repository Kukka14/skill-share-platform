package com.spring.demo.service;

import com.spring.demo.model.Follow;
import com.spring.demo.model.User;
import com.spring.demo.model.Notification;
import com.spring.demo.repository.FollowRepository;
import com.spring.demo.repository.UserRepository;
import com.spring.demo.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FollowService {

    @Autowired
    private FollowRepository followRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    /**
     * Creates a follow relationship between two users
     * 
     * @param followerId The ID of the user who is following
     * @param followedId The ID of the user being followed
     * @return The created Follow object
     */
    @Transactional
    public Follow followUser(String followerId, String followedId) {
        // Validate both users exist
        User follower = userRepository.findById(followerId)
            .orElseThrow(() -> new IllegalArgumentException("Follower user not found with ID: " + followerId));
        
        User followed = userRepository.findById(followedId)
            .orElseThrow(() -> new IllegalArgumentException("Followed user not found with ID: " + followedId));
        
        // Check if already following
        Optional<Follow> existingFollow = followRepository.findByFollowerIdAndFollowedId(followerId, followedId);
        if (existingFollow.isPresent()) {
            throw new IllegalArgumentException("Already following this user");
        }
        
        // Check if user is trying to follow themselves
        if (followerId.equals(followedId)) {
            throw new IllegalArgumentException("Cannot follow yourself");
        }
        
        // Create new follow relationship
        Follow follow = new Follow(followerId, followedId);
        Follow savedFollow = followRepository.save(follow);
        
        // Create notification for the followed user
        try {
            Notification notification = new Notification();
            notification.setUserId(followerId); // Who performed the action
            notification.setUsername(follower.getUsername());
            notification.setPostUserId(followedId); // Who will receive the notification
            notification.setDescription(follower.getUsername() + " started following you.");
            notification.setRead(false);
            notification.setTimestamp(LocalDateTime.now());
            
            notificationRepository.save(notification);
        } catch (Exception e) {
            // Log but don't fail follow action if notification creation fails
            System.err.println("Failed to create notification for follow: " + e.getMessage());
        }
        
        return savedFollow;
    }
    
    /**
     * Removes a follow relationship between two users
     * 
     * @param followerId The ID of the user who is unfollowing
     * @param followedId The ID of the user being unfollowed
     */
    @Transactional
    public void unfollowUser(String followerId, String followedId) {
        // Check if the follow relationship exists
        Optional<Follow> follow = followRepository.findByFollowerIdAndFollowedId(followerId, followedId);
        if (!follow.isPresent()) {
            throw new IllegalArgumentException("Not following this user");
        }
        
        // Delete the follow relationship
        followRepository.delete(follow.get());
    }
    
    /**
     * Gets all followers of a user
     * 
     * @param userId The ID of the user
     * @return List of Follow objects representing the followers
     */
    public List<Follow> getFollowers(String userId) {
        return followRepository.findByFollowedId(userId);
    }
    
    /**
     * Gets all users that a user is following
     * 
     * @param userId The ID of the user
     * @return List of Follow objects representing the followed users
     */
    public List<Follow> getFollowing(String userId) {
        return followRepository.findByFollowerId(userId);
    }
    
    /**
     * Gets the count of users that a user is following
     * 
     * @param userId The ID of the user
     * @return The count of followed users
     */
    public long getFollowingCount(String userId) {
        return followRepository.countByFollowerId(userId);
    }
    
    /**
     * Gets the count of followers for a user
     * 
     * @param userId The ID of the user
     * @return The count of followers
     */
    public long getFollowersCount(String userId) {
        return followRepository.countByFollowedId(userId);
    }
    
    /**
     * Checks if a user is following another user
     * 
     * @param followerId The ID of the potential follower
     * @param followedId The ID of the potentially followed user
     * @return True if the follow relationship exists, false otherwise
     */
    public boolean isFollowing(String followerId, String followedId) {
        return followRepository.findByFollowerIdAndFollowedId(followerId, followedId).isPresent();
    }
}
