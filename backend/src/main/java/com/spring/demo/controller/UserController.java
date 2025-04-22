package com.spring.demo.controller;

import com.spring.demo.model.User;
import com.spring.demo.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
} 