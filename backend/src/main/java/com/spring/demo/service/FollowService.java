package com.spring.demo.service;

import com.spring.demo.model.User;
import com.spring.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class FollowService {

    @Autowired
    private UserRepository userRepository;

    public String followUser(String userId, String targetUserId) {
        if (userId.equals(targetUserId)) {
            throw new IllegalArgumentException("You cannot follow yourself.");
        }

        Optional<User> userOptional = userRepository.findById(userId);
        Optional<User> targetUserOptional = userRepository.findById(targetUserId);

        if (userOptional.isEmpty() || targetUserOptional.isEmpty()) {
            throw new IllegalArgumentException("User not found.");
        }

        User user = userOptional.get();
        User targetUser = targetUserOptional.get();

        // Add targetUserId to the user's following list
        if (user.getFollowing().add(targetUserId)) {
            // Add userId to the target user's followers list
            targetUser.getFollowers().add(userId);

            // Save both users
            userRepository.save(user);
            userRepository.save(targetUser);

            return "Successfully followed the user.";
        } else {
            return "You are already following this user.";
        }
    }

    public String unfollowUser(String userId, String targetUserId) {
        Optional<User> userOptional = userRepository.findById(userId);
        Optional<User> targetUserOptional = userRepository.findById(targetUserId);

        if (userOptional.isEmpty() || targetUserOptional.isEmpty()) {
            throw new IllegalArgumentException("User not found.");
        }

        User user = userOptional.get();
        User targetUser = targetUserOptional.get();

        // Remove targetUserId from the user's following list
        if (user.getFollowing().remove(targetUserId)) {
            // Remove userId from the target user's followers list
            targetUser.getFollowers().remove(userId);

            // Save both users
            userRepository.save(user);
            userRepository.save(targetUser);

            return "Successfully unfollowed the user.";
        } else {
            return "You are not following this user.";
        }
    }
}