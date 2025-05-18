package com.spring.demo.controller;

import com.spring.demo.dto.JwtResponse;
import com.spring.demo.dto.LoginRequest;
import com.spring.demo.dto.SignupRequest;
import com.spring.demo.dto.GoogleAuthRequest;
import com.spring.demo.model.User;
import com.spring.demo.service.AuthService;
import com.spring.demo.exception.CustomException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.HashMap;
import java.util.Map;
//added by nethmi

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        logger.info("Received signup request for username: {}", request.getUsername());
        try {
            User user = authService.signup(request);
            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("message", "User registered successfully");
            return ResponseEntity.ok(response);
        } catch (CustomException e) {
            logger.error("Signup failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        logger.info("Received login request for username: {}", request.getUsername());
        try {
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                throw new CustomException("Username is required");
            }
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                throw new CustomException("Password is required");
            }

            JwtResponse response = authService.login(request);
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("token", response.getToken());
            responseBody.put("message", "Login successful");
            return ResponseEntity.ok(responseBody);
        } catch (CustomException e) {
            logger.error("Login failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        logger.info("Received logout request");
        // JWT is stateless, so we don't need to do anything server-side
        // The frontend will remove the token
        return ResponseEntity.ok().body(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        logger.info("Received token validation request");
        // This endpoint can be used to validate tokens and get current user info
        // The JWT filter will handle the validation
        return ResponseEntity.ok().body(Map.of("message", "Token is valid"));
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleAuthRequest request) {
        logger.info("Received Google login request for email: {}", request.getEmail());
        try {
            JwtResponse response = authService.handleGoogleAuth(request);
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("token", response.getToken());
            responseBody.put("message", "Google login successful");
            return ResponseEntity.ok(responseBody);
        } catch (CustomException e) {
            logger.error("Google login failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
