package com.skillshare.service;

import com.skillshare.model.User;
import com.skillshare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.Claims;
import java.util.Date;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final String JWT_SECRET = "your-secret-key"; // In production, use environment variable

    public User createUser(User user) {
        // Check if user already exists
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("User with this email already exists");
        }

        // Hash password if not using Google auth
        if (user.getGoogleId() == null && user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        return userRepository.save(user);
    }

    public User authenticateUser(String email, String password) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        if (user.getGoogleId() != null) {
            throw new RuntimeException("This account uses Google authentication");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }

    public User authenticateGoogleUser(String email, String googleId, String firstName, String lastName, String profileImage) {
        User user = userRepository.findByEmail(email);
        
        if (user == null) {
            // Create new user if doesn't exist
            user = new User();
            user.setEmail(email);
            user.setGoogleId(googleId);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setProfileImage(profileImage);
            user.setUsername(email.split("@")[0]); // Use email prefix as username
            return userRepository.save(user);
        }

        // Update existing user's Google info if needed
        if (!googleId.equals(user.getGoogleId())) {
            user.setGoogleId(googleId);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setProfileImage(profileImage);
            return userRepository.save(user);
        }

        return user;
    }

    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("role", user.getRole())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 24 hours
                .signWith(SignatureAlgorithm.HS512, JWT_SECRET)
                .compact();
    }

    public String getEmailFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(JWT_SECRET)
                    .parseClaimsJws(token)
                    .getBody();

            return claims.getSubject();
        } catch (Exception e) {
            throw new RuntimeException("Invalid token");
        }
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User findByGoogleId(String googleId) {
        return userRepository.findByGoogleId(googleId);
    }
} 