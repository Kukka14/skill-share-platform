package com.spring.demo.dto;

import lombok.Data;

@Data
public class GoogleAuthRequest {
    private String email;
    private String name;
    private String googleId;
    private String profileImage;
} 