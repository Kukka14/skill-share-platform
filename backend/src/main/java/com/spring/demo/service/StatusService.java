package com.spring.demo.service;

import com.spring.demo.model.Status;
import com.spring.demo.model.User;
import com.spring.demo.repository.StatusRepository;
import com.spring.demo.repository.UserRepository;
import com.spring.demo.dto.StatusWithUserDTO;
import com.spring.demo.exception.CustomException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

//added by nethmi
import com.spring.demo.model.Notification;
import com.spring.demo.repository.NotificationRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StatusService {
    private final StatusRepository statusRepository;
    private final UserRepository userRepository;

    private final NotificationRepository notificationRepository;


    private final String uploadPath = "./uploads/status";

    public StatusService(StatusRepository statusRepository, UserRepository userRepository,NotificationRepository notificationRepository) {
        this.statusRepository = statusRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;//added by nethmi 
    }

    public Status createStatus(String username, String text, MultipartFile image) throws IOException {
        // Find user by username instead of ID
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException("User not found"));

        Status status = new Status();
        status.setUserId(user.getId()); // Set the actual user ID
        status.setText(text);
        status.setCreatedAt(LocalDateTime.now());
        status.setExpiresAt(LocalDateTime.now().plusHours(24));
        status.setActive(true);

        if (image != null && !image.isEmpty()) {
            // Create upload directory if it doesn't exist
            Path uploadDir = Paths.get(uploadPath);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            // Generate unique filename
            String originalFilename = image.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadDir.resolve(filename);
            Files.copy(image.getInputStream(), filePath);

            status.setImageUrl("http://localhost:8080/uploads/status/" + filename);
        }

        //return statusRepository.save(status);


        // added by nethmi 
        Status savedStatus = statusRepository.save(status);

            // ✅ Create a notification when status is created
Notification notification = new Notification();
notification.setUserId(user.getId());
notification.setUsername(user.getUsername());
notification.setDescription(user.getUsername() + " created a new status.");
notification.setStatusId(savedStatus.getId()); // ✅ set statusId
notification.setStatusUserId(user.getId());    // ✅ set statusUserId (same as user.getId())
notification.setRead(false);
notification.setTimestamp(LocalDateTime.now());

// Save the notification
notificationRepository.save(notification);


            return savedStatus;



    }

    public Status updateStatus(String statusId, String username, String text, MultipartFile image) throws IOException {
        Status status = statusRepository.findById(statusId)
                .orElseThrow(() -> new CustomException("Status not found"));

        // Find user by username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException("User not found"));

        if (!status.getUserId().equals(user.getId())) {
            throw new CustomException("You can only update your own status");
        }

        // Reset expiration time to 24 hours from now
        status.setExpiresAt(LocalDateTime.now().plusHours(24));
        status.setActive(true);

        if (text != null) {
            status.setText(text);
        }

        if (image != null && !image.isEmpty()) {
            // Delete old image if exists
            if (status.getImageUrl() != null) {
                String oldFilename = status.getImageUrl().substring(status.getImageUrl().lastIndexOf("/") + 1);
                Path oldFilePath = Paths.get(uploadPath, oldFilename);
                Files.deleteIfExists(oldFilePath);
            }

            // Save new image
            String originalFilename = image.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(uploadPath, filename);
            Files.copy(image.getInputStream(), filePath);

            status.setImageUrl("http://localhost:8080/uploads/status/" + filename);
        }

        return statusRepository.save(status);
    }

    public void deleteStatus(String statusId, String username) throws IOException {
        Status status = statusRepository.findById(statusId)
                .orElseThrow(() -> new CustomException("Status not found"));

        // Find user by username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException("User not found"));

        if (!status.getUserId().equals(user.getId())) {
            throw new CustomException("You can only delete your own status");
        }

        // Delete image if exists
        if (status.getImageUrl() != null) {
            String filename = status.getImageUrl().substring(status.getImageUrl().lastIndexOf("/") + 1);
            Path filePath = Paths.get(uploadPath, filename);
            Files.deleteIfExists(filePath);
        }

        statusRepository.delete(status);
    }

    public List<StatusWithUserDTO> getUserStatuses(String username) {
        // Find user by username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException("User not found"));

        List<Status> statuses = statusRepository.findByUserIdAndIsActiveTrue(user.getId());
        return statuses.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<StatusWithUserDTO> getAllActiveStatuses() {
        List<Status> statuses = statusRepository.findByIsActiveTrue();
        return statuses.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private StatusWithUserDTO convertToDTO(Status status) {
        StatusWithUserDTO dto = new StatusWithUserDTO();
        dto.setId(status.getId());
        dto.setText(status.getText());
        dto.setImageUrl(status.getImageUrl());
        dto.setCreatedAt(status.getCreatedAt());
        dto.setExpiresAt(status.getExpiresAt());
        dto.setActive(status.isActive());
        dto.setUserId(status.getUserId());
        return dto;
    }

    public void deactivateExpiredStatuses() {
        LocalDateTime now = LocalDateTime.now();
        List<Status> expiredStatuses = statusRepository.findByExpiresAtBeforeAndIsActiveTrue(now);
        
        for (Status status : expiredStatuses) {
            status.setActive(false);
            statusRepository.save(status);
        }
    }
}