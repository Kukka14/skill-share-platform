package com.spring.demo.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StatusWithUserDTO {
    private String id;
    private String text;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean isActive;
    
    // User information
    private String userId;
} 