package com.spring.demo.controller;

import com.spring.demo.model.Like;
import com.spring.demo.model.Comment;
import com.spring.demo.service.LikeService;
import com.spring.demo.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/interactions")
@CrossOrigin(origins = "*")
public class InteractionController {

    private final LikeService likeService;
    private final CommentService commentService;

    public InteractionController(LikeService likeService, CommentService commentService) {
        this.likeService = likeService;
        this.commentService = commentService;
    }

    // Like endpoints
    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<?> likePost(
            @PathVariable String postId,
            @RequestParam String userId) {
        try {
            System.out.println("Attempting to like post: " + postId + " by user: " + userId);
            Like like = likeService.createLike(userId, postId);
            return ResponseEntity.ok(like);
        } catch (IllegalArgumentException e) {
            System.err.println("IllegalArgumentException in likePost: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Exception in likePost: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error liking post: " + e.getMessage());
        }
    }

    @DeleteMapping("/posts/{postId}/like")
    public ResponseEntity<?> unlikePost(
            @PathVariable String postId,
            @RequestParam String userId) {
        try {
            System.out.println("Attempting to unlike post: " + postId + " by user: " + userId);
            likeService.removeLike(userId, postId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            System.err.println("IllegalArgumentException in unlikePost: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Exception in unlikePost: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error unliking post: " + e.getMessage());
        }
    }

    @GetMapping("/posts/{postId}/likes")
    public ResponseEntity<List<Like>> getPostLikes(@PathVariable String postId) {
        return ResponseEntity.ok(likeService.getLikesByPostId(postId));
    }

    @GetMapping("/posts/{postId}/likes/count")
    public ResponseEntity<Long> getLikeCount(@PathVariable String postId) {
        return ResponseEntity.ok(likeService.getLikeCount(postId));
    }

    // Comment endpoints
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<?> createComment(
            @PathVariable String postId,
            @RequestParam String userId,
            @RequestBody String content) {
        try {
            System.out.println("Creating comment for post: " + postId + " by user: " + userId);
            System.out.println("Raw content: " + content);
            
            // Clean up the content string which might have quotes from JSON
            String cleanContent = content;
            if (content.startsWith("\"") && content.endsWith("\"")) {
                cleanContent = content.substring(1, content.length() - 1);
            }
            
            // Handle escaped quotes that might come from JSON parsing
            cleanContent = cleanContent.replace("\\\"", "\"");
            
            System.out.println("Cleaned content: " + cleanContent);
            
            Comment comment = commentService.createComment(userId, postId, cleanContent);
            return ResponseEntity.ok(comment);
        } catch (IllegalArgumentException e) {
            System.err.println("IllegalArgumentException in createComment: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Exception in createComment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error creating comment: " + e.getMessage());
        }
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable String commentId,
            @RequestBody String content) {
        try {
            Comment updated = commentService.updateComment(commentId, content);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable String commentId) {
        try {
            commentService.deleteComment(commentId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<Comment>> getPostComments(@PathVariable String postId) {
        return ResponseEntity.ok(commentService.getCommentsByPostId(postId));
    }

    @GetMapping("/users/{userId}/comments")
    public ResponseEntity<List<Comment>> getUserComments(@PathVariable String userId) {
        return ResponseEntity.ok(commentService.getCommentsByUserId(userId));
    }

    @GetMapping("/posts/{postId}/comments/count")
    public ResponseEntity<Long> getCommentCount(@PathVariable String postId) {
        return ResponseEntity.ok(commentService.getCommentCount(postId));
    }
}
