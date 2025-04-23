
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

}