package com.spring.demo.service;

import com.spring.demo.dto.LoginRequest;
import com.spring.demo.dto.SignupRequest;
import com.spring.demo.dto.JwtResponse;
import com.spring.demo.dto.GoogleAuthRequest;
import com.spring.demo.exception.CustomException;
import com.spring.demo.model.User;
import com.spring.demo.repository.UserRepository;
import com.spring.demo.util.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final NotificationService notificationService;

    public AuthService(UserRepository userRepository, 
                      JwtUtil jwtUtil, 
                      PasswordEncoder passwordEncoder,
                      AuthenticationManager authenticationManager,
                      NotificationService notificationService) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.notificationService = notificationService;
    }

    public User signup(SignupRequest request) {
        logger.info("Processing signup request for username: {}", request.getUsername());
        
        if (userRepository.existsByUsername(request.getUsername())) {
            logger.warn("Signup failed: Username {} is already taken", request.getUsername());
            throw new CustomException("Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            logger.warn("Signup failed: Email {} is already in use", request.getEmail());
            throw new CustomException("Email is already in use!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setBio("");
        user.setProfileImageUrl("");
        user.setEnabled(true);

        User savedUser = userRepository.save(user);
        notificationService.createSignupNotification(savedUser.getId(), savedUser.getUsername());
        
        logger.info("Successfully created user: {}", savedUser.getUsername());
        return savedUser;
    }

    public JwtResponse login(LoginRequest request) {
        logger.info("Processing login request for username: {}", request.getUsername());
        
        try {
            // First check if user exists
            User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> {
                    logger.warn("Login failed: User not found with username: {}", request.getUsername());
                    return new CustomException("Invalid username or password");
                });

            // Verify password manually first
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                logger.warn("Login failed: Invalid password for user: {}", request.getUsername());
                throw new CustomException("Invalid username or password");
            }

            // Then attempt authentication
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            
            String token = jwtUtil.generateToken(authentication.getName());
            logger.info("Successfully authenticated user: {}", request.getUsername());
            return new JwtResponse(token);
        } catch (Exception e) {
            logger.error("Login failed for user {}: {}", request.getUsername(), e.getMessage());
            throw new CustomException("Invalid username or password");
        }
    }

    public JwtResponse handleGoogleAuth(GoogleAuthRequest request) {
        logger.info("Processing Google auth request for email: {}", request.getEmail());
        
        // Check if user exists with this Google ID
        Optional<User> existingUser = userRepository.findByGoogleId(request.getGoogleId());
        
        if (existingUser.isPresent()) {
            // User exists, generate token
            String token = jwtUtil.generateToken(existingUser.get().getUsername());
            logger.info("Successfully authenticated existing Google user: {}", existingUser.get().getUsername());
            return new JwtResponse(token);
        }

        // Check if user exists with this email
        Optional<User> userByEmail = userRepository.findByEmail(request.getEmail());
        if (userByEmail.isPresent()) {
            // Link Google account to existing user
            User user = userByEmail.get();
            user.setGoogleId(request.getGoogleId());
            user.setProfileImageUrl(request.getProfileImage());
            userRepository.save(user);
            
            String token = jwtUtil.generateToken(user.getUsername());
            logger.info("Successfully linked Google account to existing user: {}", user.getUsername());
            return new JwtResponse(token);
        }

        // Create new user
        User user = new User();
        String[] nameParts = request.getName().split(" ", 2);
        user.setFirstName(nameParts[0]);
        user.setLastName(nameParts.length > 1 ? nameParts[1] : "");
        user.setEmail(request.getEmail());
        user.setUsername(request.getEmail().split("@")[0]); // Use email prefix as username
        user.setGoogleId(request.getGoogleId());
        user.setProfileImageUrl(request.getProfileImage());
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // Random password for Google users
        user.setEnabled(true);
        
        User savedUser = userRepository.save(user);
        notificationService.createSignupNotification(savedUser.getId(), savedUser.getUsername());
        
        String token = jwtUtil.generateToken(savedUser.getUsername());
        logger.info("Successfully created and authenticated new Google user: {}", savedUser.getUsername());
        return new JwtResponse(token);
    }
}
