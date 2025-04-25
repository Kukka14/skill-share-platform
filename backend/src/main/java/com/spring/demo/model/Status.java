package com.spring.demo.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "statuses")
public class Status {
    @Id
    private String id;
    private String userId;
    private String text;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean isActive;
}