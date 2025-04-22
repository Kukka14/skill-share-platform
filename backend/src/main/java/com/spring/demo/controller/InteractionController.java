package com.spring.demo.controller;

import com.spring.demo.model.User;
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
            @AuthenticationPrincipal User user) {
        Like like = likeService.createLike(user.getId(), postId);
        return ResponseEntity.ok(like);
    }

    @DeleteMapping("/posts/{postId}/like")
    public ResponseEntity<?> unlikePost(
            @PathVariable String postId,
            @AuthenticationPrincipal User user) {
        likeService.removeLike(user.getId(), postId);
        return ResponseEntity.ok().build();
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
    public ResponseEntity<Comment> createComment(
            @PathVariable String postId,
            @AuthenticationPrincipal User user,
            @RequestBody String content) {
        Comment comment = commentService.createComment(user.getId(), postId, content);
        return ResponseEntity.ok(comment);
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<Comment> updateComment(
            @PathVariable String commentId,
            @RequestBody String content) {
        Comment updated = commentService.updateComment(commentId, content);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable String commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<Comment>> getPostComments(@PathVariable String postId) {
        return ResponseEntity.ok(commentService.getCommentsByPostId(postId));
    }

    @GetMapping("/users/{userId}/comments")
    public ResponseEntity<List<Comment>> getUserComments(@PathVariable String userId) {
        return ResponseEntity.ok(commentService.getCommentsByUser(userId));
    }

    @GetMapping("/comments/search")
    public ResponseEntity<List<Comment>> searchComments(@RequestParam String keyword) {
        return ResponseEntity.ok(commentService.searchComments(keyword));
    }

    @GetMapping("/posts/{postId}/comments/count")
    public ResponseEntity<Long> getCommentCount(@PathVariable String postId) {
        return ResponseEntity.ok(commentService.getCommentCount(postId));
    }
}
