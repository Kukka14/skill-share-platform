///added by nethmi


package com.spring.demo.service;


import com.spring.demo.model.Notification;
import com.spring.demo.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void createSignupNotification(String userId, String username) {

        System.out.println("⚡ Creating notification for: " + username);

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setUsername(username);
        notification.setDescription(username + " has successfully signed up.");
        notification.setRead(false);
        notification.setTimestamp(LocalDateTime.now());

        notificationRepository.save(notification);
    }

  public List<Notification> getNotificationsByUserId(String userId) {
        return notificationRepository.findByUserId(userId);
    }
    

    public void markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
    
        notification.setRead(true);
        notificationRepository.save(notification);
    }
   

    public void deleteNotification(String notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new RuntimeException("Notification not found");
        }
        notificationRepository.deleteById(notificationId);
    }
    

    
}