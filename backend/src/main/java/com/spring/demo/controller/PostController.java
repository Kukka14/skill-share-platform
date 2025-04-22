package com.spring.demo.controller;

import com.spring.demo.model.Post;
import com.spring.demo.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping
    public ResponseEntity<?> createPost(
            @RequestParam("userId") String userId,
            @RequestParam("description") String description,
            @RequestParam("mediaFiles") List<MultipartFile> mediaFiles) {
        try {
            Post post = postService.createPost(userId, description, mediaFiles);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        List<Post> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(@PathVariable String id) {
        try {
            Post post = postService.getPostById(id);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Post>> getPostsByUserId(@PathVariable String userId) {
        List<Post> posts = postService.getPostsByUserId(userId);
        return ResponseEntity.ok(posts);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(
            @PathVariable String id,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "mediaFiles", required = false) List<MultipartFile> mediaFiles) {
        try {
            Post updatedPost = postService.updatePost(id, description, mediaFiles);
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable String id) {
        try {
            postService.deletePost(id);
            return ResponseEntity.ok("Post deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 