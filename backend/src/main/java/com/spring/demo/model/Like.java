package com.spring.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.Data;

import java.time.LocalDateTime;

@Document(collection = "likes")
@Data
public class Like {
    @Id
    private String id;

    @DBRef
    private User user;

    private String postId;  // Keeping this as String until Post entity is implemented

    private LocalDateTime createdAt;

    // Constructor to initialize createdAt
    public Like() {
        this.createdAt = LocalDateTime.now();
    }
}