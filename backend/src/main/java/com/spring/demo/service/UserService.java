package com.spring.demo.service;

import com.spring.demo.model.User;
import com.spring.demo.repository.UserRepository;
import com.spring.demo.util.JwtUtil;
import com.spring.demo.exception.CustomException;
import com.spring.demo.dto.UpdateProfileRequest;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final String uploadPath = "./uploads";

    public UserService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public User getCurrentUser(String token) {
        String username = jwtUtil.extractUsername(token.replace("Bearer ", ""));
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException("User not found"));
    }

    public User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found"));
    }

    public User updateProfile(String userId, UpdateProfileRequest request) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found"));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        if (request.getProfileImage() != null && !request.getProfileImage().isEmpty()) {
            // Create upload directory if it doesn't exist
            Path uploadDir = Paths.get(uploadPath);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            // Generate unique filename
            String originalFilename = request.getProfileImage().getOriginalFilename();
            if (originalFilename == null) {
                throw new CustomException("Invalid file name");
            }
            
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadDir.resolve(filename);
            Files.copy(request.getProfileImage().getInputStream(), filePath);

            // Update profile image URL
            user.setProfileImageUrl("/uploads/" + filename);
        }

        return userRepository.save(user);
    }
}