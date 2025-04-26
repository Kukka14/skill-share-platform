package com.spring.demo.controller;

import com.spring.demo.model.User;
import com.spring.demo.service.UserService;
import com.spring.demo.service.FollowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    private final UserService userService;

    @Autowired
    private FollowService followService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(userService.getCurrentUser(token));
    }

    @PostMapping("/{userId}/follow/{targetUserId}")
    public ResponseEntity<?> followUser(
            @PathVariable String userId,
            @PathVariable String targetUserId) {
        try {
            String message = followService.followUser(userId, targetUserId);
            return ResponseEntity.ok(message);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{userId}/unfollow/{targetUserId}")
    public ResponseEntity<?> unfollowUser(
            @PathVariable String userId,
            @PathVariable String targetUserId) {
        try {
            String message = followService.unfollowUser(userId, targetUserId);
            return ResponseEntity.ok(message);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}