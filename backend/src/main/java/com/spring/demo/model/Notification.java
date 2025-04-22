
//create by nethmi
package com.spring.demo.model;


import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "notifications")
public class Notification {
    @Id
    private String notificationId;
    private String userId;
    private String username;
    private String description;
    private boolean isRead;
    private LocalDateTime timestamp;




    // Getters
    // public String getNotificationId() {
    //     return notificationId;
    // }

    // public String getUserId() {
    //     return userId;
    // }

    // public String getUsername() {
    //     return username;
    // }

    // public String getDescription() {
    //     return description;
    // }

    // public boolean isRead() {
    //     return isRead;
    // }

    // public LocalDateTime getTimestamp() {
    //     return timestamp;
    // }

    //Setters
    // public void setNotificationId(String notificationId) {
    //     this.notificationId = notificationId;
    // }

    // public void setUserId(String userId) {
    //     this.userId = userId;
    // }

    // public void setUsername(String username) {
    //     this.username = username;
    // }

    // public void setDescription(String description) {
    //     this.description = description;
    // }

    // public void setIsRead(boolean isRead) {
    //     this.isRead = isRead;
    // }

    // public void setTimestamp(LocalDateTime timestamp) {
    //     this.timestamp = timestamp;
    // }
}