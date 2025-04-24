package com.spring.demo.controller;

import com.spring.demo.dto.LearningProgressDTO;
import com.spring.demo.service.LearningProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/learning-progress")
@CrossOrigin(origins = "*")
public class LearningProgressController {

    @Autowired
    private LearningProgressService learningProgressService;

    @PostMapping
    public ResponseEntity<LearningProgressDTO> createProgressUpdate(@RequestBody LearningProgressDTO progressDTO) {
        LearningProgressDTO createdProgress = learningProgressService.createProgressUpdate(progressDTO);
        return ResponseEntity.ok(createdProgress);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearningProgressDTO> updateProgressUpdate(
            @PathVariable String id,
            @RequestBody LearningProgressDTO progressDTO) {
        try {
            LearningProgressDTO updatedProgress = learningProgressService.updateProgressUpdate(id, progressDTO);
            return ResponseEntity.ok(updatedProgress);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProgressUpdate(@PathVariable String id) {
        try {
            learningProgressService.deleteProgressUpdate(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Learning progress deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LearningProgressDTO>> getUserProgressUpdates(@PathVariable String userId) {
        List<LearningProgressDTO> progressUpdates = learningProgressService.getUserProgressUpdates(userId);
        return ResponseEntity.ok(progressUpdates);
    }

    @GetMapping("/template/{templateType}")
    public ResponseEntity<List<LearningProgressDTO>> getProgressUpdatesByTemplate(@PathVariable String templateType) {
        List<LearningProgressDTO> progressUpdates = learningProgressService.getProgressUpdatesByTemplate(templateType);
        return ResponseEntity.ok(progressUpdates);
    }
} 