package com.spring.demo.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LearningProgressDTO {
    private String id;
    private String userId;
    private String title;
    private String description;
    private String templateType;
    private String completedItems;
    private String newSkills;
    private LocalDateTime createdAt;
} 