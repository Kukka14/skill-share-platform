package com.spring.demo.controller;

import com.spring.demo.model.Follow;
import com.spring.demo.service.FollowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/follows")
public class FollowController {

    @Autowired
    private FollowService followService;

    @PostMapping
    public ResponseEntity<?> followUser(
            @RequestParam String followerId,
            @RequestParam String followedId) {
        try {
            System.out.println("User " + followerId + " is following user " + followedId);
            Follow follow = followService.followUser(followerId, followedId);
            return ResponseEntity.ok(follow);
        } catch (IllegalArgumentException e) {
            System.err.println("IllegalArgumentException in followUser: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Exception in followUser: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error following user: " + e.getMessage());
        }
    }

    @DeleteMapping
    public ResponseEntity<?> unfollowUser(
            @RequestParam String followerId,
            @RequestParam String followedId) {
        try {
            System.out.println("User " + followerId + " is unfollowing user " + followedId);
            followService.unfollowUser(followerId, followedId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            System.err.println("IllegalArgumentException in unfollowUser: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Exception in unfollowUser: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error unfollowing user: " + e.getMessage());
        }
    }

    @GetMapping("/followers")
    public ResponseEntity<List<Follow>> getFollowers(@RequestParam String userId) {
        return ResponseEntity.ok(followService.getFollowers(userId));
    }

    @GetMapping("/following")
    public ResponseEntity<List<Follow>> getFollowing(@RequestParam String userId) {
        return ResponseEntity.ok(followService.getFollowing(userId));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getFollowingCount(@RequestParam String userId) {
        return ResponseEntity.ok(followService.getFollowingCount(userId));
    }

    @GetMapping("/followers/count")
    public ResponseEntity<Long> getFollowersCount(@RequestParam String userId) {
        return ResponseEntity.ok(followService.getFollowersCount(userId));
    }

    @GetMapping("/status")
    public ResponseEntity<Boolean> isFollowing(
            @RequestParam String followerId,
            @RequestParam String followedId) {
        return ResponseEntity.ok(followService.isFollowing(followerId, followedId));
    }
}
