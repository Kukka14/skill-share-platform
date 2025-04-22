package com.spring.demo.service;

import com.spring.demo.model.Post;
import com.spring.demo.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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

        return postRepository.save(post);
    }

    private boolean isValidMediaType(String contentType) {
        return contentType != null && 
               (contentType.startsWith("image/") || contentType.startsWith("video/"));
    }
} 