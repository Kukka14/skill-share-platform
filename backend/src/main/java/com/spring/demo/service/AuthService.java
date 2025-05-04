package com.spring.demo.service;

import com.spring.demo.dto.LoginRequest;
import com.spring.demo.dto.SignupRequest;
import com.spring.demo.dto.JwtResponse;
import com.spring.demo.exception.CustomException;
import com.spring.demo.model.User;
import com.spring.demo.repository.UserRepository;
import com.spring.demo.util.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
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
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new CustomException("Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
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

        User savedUser = userRepository.save(user);
        notificationService.createSignupNotification(savedUser.getId(), savedUser.getUsername());

        return savedUser;
    }

    public JwtResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            
            String token = jwtUtil.generateToken(authentication.getName());
            return new JwtResponse(token);
        } catch (Exception e) {
            throw new CustomException("Invalid username or password");
        }
    }
}
