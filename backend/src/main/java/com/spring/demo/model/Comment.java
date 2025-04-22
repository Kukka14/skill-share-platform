package com.spring.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.Data;

import java.time.LocalDateTime;

@Document(collection = "comments")
@Data
public class Comment {
    @Id
    private String id;

    @DBRef
    private User user;

    private String postId;  // Reference to post until Post entity is implemented

    private String content;  // The actual comment text

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Constructor to initialize timestamps
    public Comment() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }
}
