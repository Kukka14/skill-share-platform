package com.spring.demo.controller;

import com.spring.demo.model.Notification;
import com.spring.demo.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.CollectionModel;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;


import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    

    @GetMapping("/{notificationId}")
    public ResponseEntity<Notification> getNotificationById(@PathVariable String notificationId) {
        Notification notification = notificationService.getById(notificationId);
        return ResponseEntity.ok(notification);
    }



    @GetMapping("/user/{userId}")
    public ResponseEntity<CollectionModel<EntityModel<Notification>>> getNotificationsByUserId(@PathVariable String userId) {
        List<Notification> notifications = notificationService.getNotificationsByUserId(userId);

        List<EntityModel<Notification>> notificationModels = notifications.stream()
            .map(notification -> EntityModel.of(notification,
                linkTo(methodOn(NotificationController.class).getNotificationById(notification.getNotificationId())).withSelfRel(),
                linkTo(methodOn(NotificationController.class).markAsRead(notification.getNotificationId())).withRel("markAsRead"),
                linkTo(methodOn(NotificationController.class).deleteNotification(notification.getNotificationId())).withRel("delete")
            ))
            .toList();

        return ResponseEntity.ok(CollectionModel.of(notificationModels));
    }



    // Mark a specific notification as read
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<String> markAsRead(@PathVariable String notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok("Notification marked as read successfully.");
    }


    @DeleteMapping("/{notificationId}")
    public ResponseEntity<String> deleteNotification(@PathVariable String notificationId) {
    try {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok("Notification deleted successfully.");
    } catch (RuntimeException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    }
}


@DeleteMapping("/bulk")
public ResponseEntity<String> deleteMultipleNotifications(@RequestBody List<String> notificationIds) {
    try {
        notificationService.deleteMultipleNotifications(notificationIds);
        return ResponseEntity.ok("Notifications deleted successfully.");
    } catch (Exception e) {
        return ResponseEntity.status(500).body("Failed to delete notifications.");
    }
}


}
