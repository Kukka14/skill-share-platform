package com.spring.demo.service;

import com.spring.demo.dto.LoginRequest;
import com.spring.demo.dto.SignupRequest;
import com.spring.demo.dto.JwtResponse;
import com.spring.demo.exception.CustomException;
import com.spring.demo.model.User;
import com.spring.demo.repository.UserRepository;
import com.spring.demo.util.JwtUtil;
import org.springframework.stereotype.Service;
import com.spring.demo.service.NotificationService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    //notification object 
    private final NotificationService notificationService;

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil,NotificationService notificationService) {//added by nethmi
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.notificationService = notificationService;// added by nethmi
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
        user.setPassword(request.getPassword()); // plaintext or encoded
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setBio("");
        user.setProfileImageUrl("");

        User savedUser = userRepository.save(user);  //added by nethmi

        notificationService.createSignupNotification(savedUser.getId(), savedUser.getUsername()); // added by nethmi

        System.out.println("Saved user ID: " + savedUser.getId());
        System.out.println("Creating notification...");


        return savedUser; // added by nethmi
    }

    public JwtResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new CustomException("User not found"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new CustomException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getUsername());
        return new JwtResponse(token);
    }
}
