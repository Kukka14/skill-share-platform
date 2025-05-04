package com.spring.demo.controller;

import com.spring.demo.dto.JwtResponse;
import com.spring.demo.dto.LoginRequest;
import com.spring.demo.dto.SignupRequest;
import com.spring.demo.model.User;
import com.spring.demo.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
//added by nethmi

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<User> signup(@RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request) {
        JwtResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        // JWT is stateless, so we don't need to do anything server-side
        // The frontend will remove the token
        return ResponseEntity.ok().build();
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        // This endpoint can be used to validate tokens and get current user info
        // The JWT filter will handle the validation
        return ResponseEntity.ok().build();
    }
}
