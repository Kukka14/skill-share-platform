
//create by nethmi
package com.spring.demo.model;


import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

@Data
@Document(collection = "notifications")
public class Notification {
    @Id
    private String notificationId;
    private String userId;
    private String username;
    private String postId;
    private String postUserId;
    private String statusId;
    private String commentId;
    private String LikeId;
    private String statusUserId;
    private String description;
     @JsonProperty("read")

    private boolean isRead;
    private LocalDateTime timestamp;


    public String getNotificationId() {
        return notificationId;
    }
    
    public void setNotificationId(String notificationId) {
        this.notificationId = notificationId;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPostId() {
        return postId;
    }
    
    public void setPostId(String postId) {
        this.postId = postId;
    }
    
    public String getPostUserId() {
        return postUserId;
    }
    
    public void setPostUserId(String postUserId) {
        this.postUserId = postUserId;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public boolean isRead() {
        return isRead;
    }
    
    public void setRead(boolean read) {
        isRead = read;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    public String getStatusId() {
    return statusId;
}

public void setStatusId(String statusId) {
    this.statusId = statusId;
}

public String getStatusUserId() {
    return statusUserId;
}

public void setStatusUserId(String statusUserId) {
    this.statusUserId = statusUserId;
}


public String getcommentId() {
    return commentId;
}

public void setcommentId(String commentId) {
    this.commentId = commentId;
}

public String getLikeId() {
    return LikeId;
}
public void setLikeId(String LikeId) {
    this.LikeId = LikeId;
}

    

}