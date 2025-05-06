package com.spring.demo.controller;

import com.spring.demo.model.User;
import com.spring.demo.service.UserService;
import com.spring.demo.dto.UpdateProfileRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@RequestHeader("Authorization") String token) {
        User user = userService.getCurrentUser(token);
        System.out.println("Current user data: " + user);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserDetails(@PathVariable String userId) {
        System.out.println("Fetching user details for ID: " + userId);
        User user = userService.getUserById(userId);
        System.out.println("Retrieved user data: " + user);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<?> updateProfile(
            @PathVariable String userId,
            @RequestParam(value = "firstName", required = false) String firstName,
            @RequestParam(value = "lastName", required = false) String lastName,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage) {
        try {
            System.out.println("Updating profile for user ID: " + userId);
            System.out.println("Update data - firstName: " + firstName + ", lastName: " + lastName + ", bio: " + bio + ", hasProfileImage: " + (profileImage != null));
            
            UpdateProfileRequest request = new UpdateProfileRequest();
            request.setFirstName(firstName);
            request.setLastName(lastName);
            request.setBio(bio);
            request.setProfileImage(profileImage);

            User updatedUser = userService.updateProfile(userId, request);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}