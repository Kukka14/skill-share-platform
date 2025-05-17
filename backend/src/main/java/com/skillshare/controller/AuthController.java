package com.skillshare.controller;

import com.skillshare.model.User;
import com.skillshare.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        logger.debug("Received signup request for user: {}", user.getEmail());
        try {
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                throw new IllegalArgumentException("Email is required");
            }
            if (user.getPassword() == null && user.getGoogleId() == null) {
                throw new IllegalArgumentException("Either password or Google ID is required");
            }

            User savedUser = userService.createUser(user);
            String token = userService.generateToken(savedUser);
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", savedUser);
            
            logger.debug("Successfully created user: {}", savedUser.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error during signup: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        logger.debug("Received login request for email: {}", credentials.get("email"));
        try {
            if (credentials.get("email") == null || credentials.get("email").trim().isEmpty()) {
                throw new IllegalArgumentException("Email is required");
            }
            if (credentials.get("password") == null || credentials.get("password").trim().isEmpty()) {
                throw new IllegalArgumentException("Password is required");
            }

            User user = userService.authenticateUser(
                credentials.get("email"),
                credentials.get("password")
            );
            String token = userService.generateToken(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", user);
            
            logger.debug("Successfully authenticated user: {}", user.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error during login: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> googleUser) {
        logger.debug("Received Google login request for email: {}", googleUser.get("email"));
        try {
            if (googleUser.get("email") == null || googleUser.get("email").trim().isEmpty()) {
                throw new IllegalArgumentException("Email is required");
            }
            if (googleUser.get("googleId") == null || googleUser.get("googleId").trim().isEmpty()) {
                throw new IllegalArgumentException("Google ID is required");
            }

            User user = userService.authenticateGoogleUser(
                googleUser.get("email"),
                googleUser.get("googleId"),
                googleUser.get("firstName"),
                googleUser.get("lastName"),
                googleUser.get("profileImage")
            );
            String token = userService.generateToken(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", user);
            
            logger.debug("Successfully authenticated Google user: {}", user.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error during Google login: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
} 