package com.spring.demo.service;

import com.spring.demo.model.User;
import com.spring.demo.repository.UserRepository;
import com.spring.demo.util.JwtUtil;
import com.spring.demo.exception.CustomException;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public User getCurrentUser(String token) {
        String username = jwtUtil.extractUsername(token.replace("Bearer ", ""));
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException("User not found"));
    }
} 