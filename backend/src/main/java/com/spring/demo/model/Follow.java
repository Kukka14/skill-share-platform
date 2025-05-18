package com.spring.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "follows")
public class Follow {
    
    @Id
    private String id;
    private String followerId;
    private String followedId;
    private LocalDateTime createdAt;
    
    public Follow() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Follow(String followerId, String followedId) {
        this.followerId = followerId;
        this.followedId = followedId;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getFollowerId() {
        return followerId;
    }
    
    public void setFollowerId(String followerId) {
        this.followerId = followerId;
    }
    
    public String getFollowedId() {
        return followedId;
    }
    
    public void setFollowedId(String followedId) {
        this.followedId = followedId;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    @Override
    public String toString() {
        return "Follow{" +
                "id='" + id + '\'' +
                ", followerId='" + followerId + '\'' +
                ", followedId='" + followedId + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
