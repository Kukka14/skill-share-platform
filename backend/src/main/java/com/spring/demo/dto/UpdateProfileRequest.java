package com.spring.demo.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UpdateProfileRequest {
    private String firstName;
    private String lastName;
    private String bio;
    private MultipartFile profileImage;
} 