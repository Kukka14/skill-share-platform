package com.spring.demo.service;

import com.spring.demo.model.Post;
import com.spring.demo.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.spring.demo.model.Notification; //added by nethmi 
import com.spring.demo.model.User;
import com.spring.demo.repository.NotificationRepository;
import com.spring.demo.repository.UserRepository;
import java.time.LocalDateTime;


import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PostService {

    @Autowired    //added by nethmi
    private UserRepository userRepository;

    @Autowired   // added by nethmi 
    private NotificationRepository notificationRepository;


    @Value("${upload.path}")
    private String uploadPath;

    @Autowired
    private PostRepository postRepository;

    public Post createPost(String userId, String description, List<MultipartFile> mediaFiles) throws IOException {
        
        
        if (mediaFiles.size() > 3) {
            throw new IllegalArgumentException("Maximum 3 media files allowed per post");
        }

        Post post = new Post();
        post.setUserId(userId);
        post.setDescription(description);
        post.setCreatedAt(System.currentTimeMillis());

        List<String> mediaUrls = new ArrayList<>();
        List<String> mediaTypes = new ArrayList<>();

        // Create upload directory if it doesn't exist
        Path uploadDir = Paths.get(uploadPath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        for (MultipartFile file : mediaFiles) {
            // Validate file type and size
            String contentType = file.getContentType();
            if (!isValidMediaType(contentType)) {
                throw new IllegalArgumentException("Invalid media type. Only images and videos are allowed");
            }

            if (contentType.startsWith("video/") && file.getSize() > 30 * 1024 * 1024) { // 30MB limit for videos
                throw new IllegalArgumentException("Video file size exceeds 30MB limit");
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String uniqueFilename = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadDir.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath);

            // Store relative URL and media type
            mediaUrls.add("/uploads/" + uniqueFilename);
            mediaTypes.add(contentType);
        }

        post.setMediaUrls(mediaUrls);
        post.setMediaTypes(mediaTypes);

        //return postRepository.save(post);

        // Save the post first         added by nethmi
        Post savedPost = postRepository.save(post);

        // Fetch user to get username       added by nethmi
        User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

        // Create and save notification in notifications collection        added by nethmi
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setUsername(user.getUsername());
        notification.setDescription(user.getUsername() + " added a new post.");
        notification.setRead(false);
        notification.setTimestamp(LocalDateTime.now());

         notificationRepository.save(notification);

         return savedPost;   // added by nethmi
        

    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public Post getPostById(String id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found with id: " + id));
        
        User user = userRepository.findById(post.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        post.setUser(user);
        
        return post;
    }

    public List<Post> getPostsByUserId(String userId) {
        List<Post> posts = postRepository.findByUserId(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        posts.forEach(post -> {
            post.setUser(user);
        });
        
        return posts;
    }

    public Post updatePost(String id, String description, List<MultipartFile> mediaFiles) throws IOException {
        Post existingPost = getPostById(id);

        if (description != null && !description.isEmpty()) {
            existingPost.setDescription(description);
        }

        if (mediaFiles != null && !mediaFiles.isEmpty()) {
            if (mediaFiles.size() > 3) {
                throw new IllegalArgumentException("Maximum 3 media files allowed per post");
            }

            // Delete old files
            deleteOldFiles(existingPost.getMediaUrls());

            List<String> mediaUrls = new ArrayList<>();
            List<String> mediaTypes = new ArrayList<>();

            Path uploadDir = Paths.get(uploadPath);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            for (MultipartFile file : mediaFiles) {
                String contentType = file.getContentType();
                if (!isValidMediaType(contentType)) {
                    throw new IllegalArgumentException("Invalid media type. Only images and videos are allowed");
                }

                if (contentType.startsWith("video/") && file.getSize() > 30 * 1024 * 1024) {
                    throw new IllegalArgumentException("Video file size exceeds 30MB limit");
                }

                String originalFilename = file.getOriginalFilename();
                String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                String uniqueFilename = UUID.randomUUID().toString() + extension;

                Path filePath = uploadDir.resolve(uniqueFilename);
                Files.copy(file.getInputStream(), filePath);

                mediaUrls.add("/uploads/" + uniqueFilename);
                mediaTypes.add(contentType);
            }

            existingPost.setMediaUrls(mediaUrls);
            existingPost.setMediaTypes(mediaTypes);
        }

        return postRepository.save(existingPost);
    }

    public void deletePost(String id) throws IOException {
        Post post = getPostById(id);
        
        // Delete associated files
        deleteOldFiles(post.getMediaUrls());
        
        // Delete post from database
        postRepository.delete(post);
    }

    private void deleteOldFiles(List<String> mediaUrls) {
        for (String url : mediaUrls) {
            try {
                String filename = url.substring(url.lastIndexOf("/") + 1);
                Path filePath = Paths.get(uploadPath, filename);
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                // Log the error but continue with other files
                System.err.println("Error deleting file: " + e.getMessage());
            }
        }
    }

    private boolean isValidMediaType(String contentType) {
        return contentType != null && 
               (contentType.startsWith("image/") || contentType.startsWith("video/"));
    }

    
    
    
}