// package com.spring.demo.controller;

// import com.spring.demo.model.Like;
// import com.spring.demo.service.LikeService;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.web.bind.annotation.*;

// import java.util.List;

// @RestController
// @RequestMapping("/api/likes")
// public class LikeController {

//     @Autowired
//     private LikeService likeService;

//     @PostMapping("/like")
//     public String likePost(@RequestParam Long userId, @RequestParam Long postId) {
//         return likeService.likePost(userId, postId);
//     }

//     @GetMapping
//     public List<Like> getAllLikes() {
//         return likeService.getAllLikes();
//     }
// }