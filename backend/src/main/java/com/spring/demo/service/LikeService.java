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
        // Check if like already exists
        Optional<Like> existingLike = likeRepository.findByUserIdAndPostId(userId, postId);
        if (existingLike.isPresent()) {
            throw new IllegalArgumentException("User has already liked this post");
        }

        // Create new like
        Like like = new Like();
        like.setUserId(userId);
        like.setPostId(postId);

        Like savedLike = likeRepository.save(like);

       

        // Fetch the liking user
        User likingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Liking user not found"));

        // Fetch the liked post
        Post likedPost = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Create the notification
        Notification notification = new Notification();
        notification.setUserId(userId); // who liked
        notification.setUsername(likingUser.getUsername());
        notification.setPostId(postId);
        notification.setPostUserId(likedPost.getUserId()); // post owner's ID
        notification.setDescription(likingUser.getUsername() + " liked a post.");
        notification.setRead(false);
        notification.setTimestamp(LocalDateTime.now());

        notificationRepository.save(notification);

        return savedLike;

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