package com.spring.demo.controller;

import com.spring.demo.model.Like;
import com.spring.demo.model.Comment;
import com.spring.demo.service.LikeService;
import com.spring.demo.service.CommentService;
import com.spring.demo.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/interactions")
@CrossOrigin(origins = "*")
public class InteractionController {

    private final LikeService likeService;
    private final CommentService commentService;
    private final JwtUtil jwtUtil;

    public InteractionController(LikeService likeService, CommentService commentService, JwtUtil jwtUtil) {
        this.likeService = likeService;
        this.commentService = commentService;
        this.jwtUtil = jwtUtil;
    }

    // Like endpoints
    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<?> likePost(
            @PathVariable String postId,
            @RequestParam String userId) {
        try {
            Like like = likeService.createLike(userId, postId);
            return ResponseEntity.ok(like);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/posts/{postId}/like")
    public ResponseEntity<?> unlikePost(
            @PathVariable String postId,
            @RequestParam String userId) {
        try {
            likeService.removeLike(userId, postId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
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
            @RequestHeader("Authorization") String token,
            @RequestBody CommentRequest commentRequest) {
        try {
            String username = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            System.out.println("Creating comment for post: " + postId + " by user: " + username);
            System.out.println("Comment content: " + commentRequest.getContent());
            
            Comment comment = commentService.createCommentWithUsername(username, postId, commentRequest.getContent());
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ErrorResponse("An error occurred: " + e.getMessage()));
        }
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable String commentId,
            @RequestHeader("Authorization") String token,
            @RequestBody CommentRequest commentRequest) {
        try {
            String username = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            Comment updated = commentService.updateCommentWithAuth(commentId, commentRequest.getContent(), username);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ErrorResponse("An error occurred: " + e.getMessage()));
        }
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable String commentId,
            @RequestHeader("Authorization") String token) {
        try {
            String username = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            commentService.deleteCommentWithAuth(commentId, username);
            return ResponseEntity.ok().body("Comment deleted successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
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
