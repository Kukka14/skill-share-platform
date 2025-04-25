package com.spring.demo.controller;

import com.spring.demo.model.Status;
import com.spring.demo.service.StatusService;
import com.spring.demo.dto.StatusWithUserDTO;
import com.spring.demo.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/status")
public class StatusController {
    private final StatusService statusService;
    private final JwtUtil jwtUtil;

    public StatusController(StatusService statusService, JwtUtil jwtUtil) {
        this.statusService = statusService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<?> createStatus(
            @RequestHeader("Authorization") String token,
            @RequestParam(value = "text", required = false) String text,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            String userId = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            Status status = statusService.createStatus(userId, text, image);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{statusId}")
    public ResponseEntity<?> updateStatus(
            @RequestHeader("Authorization") String token,
            @PathVariable String statusId,
            @RequestParam(value = "text", required = false) String text,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            String userId = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            Status status = statusService.updateStatus(statusId, userId, text, image);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{statusId}")
    public ResponseEntity<?> deleteStatus(
            @RequestHeader("Authorization") String token,
            @PathVariable String statusId) {
        try {
            String userId = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            statusService.deleteStatus(statusId, userId);
            return ResponseEntity.ok("Status deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user")
    public ResponseEntity<List<StatusWithUserDTO>> getUserStatuses(@RequestHeader("Authorization") String token) {
        String userId = jwtUtil.extractUsername(token.replace("Bearer ", ""));
        return ResponseEntity.ok(statusService.getUserStatuses(userId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<StatusWithUserDTO>> getAllActiveStatuses() {
        return ResponseEntity.ok(statusService.getAllActiveStatuses());
    }
}