package com.spring.demo.controller;

import com.spring.demo.model.Post;
import com.spring.demo.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

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
            EntityModel<Post> resource = EntityModel.of(post,
                linkTo(methodOn(PostController.class).getPostById(post.getId())).withSelfRel(),
                linkTo(methodOn(PostController.class).getAllPosts()).withRel("posts"),
                linkTo(methodOn(PostController.class).updatePost(post.getId(), null, null)).withRel("update"),
                linkTo(methodOn(PostController.class).deletePost(post.getId())).withRel("delete")
            );
            return ResponseEntity.ok(resource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllPosts() {
        List<Post> posts = postService.getAllPosts();
        List<EntityModel<Post>> postResources = posts.stream().map(post ->
            EntityModel.of(post,
                linkTo(methodOn(PostController.class).getPostById(post.getId())).withSelfRel(),
                linkTo(methodOn(PostController.class).getAllPosts()).withRel("posts")
            )
        ).toList();
        CollectionModel<EntityModel<Post>> collectionModel = CollectionModel.of(postResources,
            linkTo(methodOn(PostController.class).getAllPosts()).withSelfRel()
        );
        return ResponseEntity.ok(collectionModel);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(@PathVariable String id) {
        try {
            Post post = postService.getPostById(id);
            EntityModel<Post> resource = EntityModel.of(post,
                linkTo(methodOn(PostController.class).getPostById(id)).withSelfRel(),
                linkTo(methodOn(PostController.class).getAllPosts()).withRel("posts")
            );
            return ResponseEntity.ok(resource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPostsByUserId(@PathVariable String userId) {
        List<Post> posts = postService.getPostsByUserId(userId);
        List<EntityModel<Post>> postResources = posts.stream().map(post ->
            EntityModel.of(post,
                linkTo(methodOn(PostController.class).getPostById(post.getId())).withSelfRel(),
                linkTo(methodOn(PostController.class).getAllPosts()).withRel("posts")
            )
        ).toList();
        CollectionModel<EntityModel<Post>> collectionModel = CollectionModel.of(postResources,
            linkTo(methodOn(PostController.class).getPostsByUserId(userId)).withSelfRel()
        );
        return ResponseEntity.ok(collectionModel);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(
            @PathVariable String id,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "mediaFiles", required = false) List<MultipartFile> mediaFiles) {
        try {
            Post updatedPost = postService.updatePost(id, description, mediaFiles);
            EntityModel<Post> resource = EntityModel.of(updatedPost,
                linkTo(methodOn(PostController.class).getPostById(id)).withSelfRel(),
                linkTo(methodOn(PostController.class).getAllPosts()).withRel("posts"),
                linkTo(methodOn(PostController.class).deletePost(id)).withRel("delete")
            );
            return ResponseEntity.ok(resource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable String id) {
        try {
            postService.deletePost(id);
            EntityModel<String> resource = EntityModel.of("Post deleted successfully",
                linkTo(methodOn(PostController.class).getAllPosts()).withRel("posts")
            );
            return ResponseEntity.ok(resource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 