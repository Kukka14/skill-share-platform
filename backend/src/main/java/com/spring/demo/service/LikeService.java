package com.spring.demo.service;

import com.spring.demo.model.Like;
import com.spring.demo.model.User;
import com.spring.demo.repository.LikeRepository;
import com.spring.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LikeService {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private UserRepository userRepository;

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

        return likeRepository.save(like);
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