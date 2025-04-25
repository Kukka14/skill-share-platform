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
        return ResponseEntity.ok(userService.getCurrentUser(token));
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<?> updateProfile(
            @PathVariable String userId,
            @RequestParam(value = "firstName", required = false) String firstName,
            @RequestParam(value = "lastName", required = false) String lastName,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage) {
        try {
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