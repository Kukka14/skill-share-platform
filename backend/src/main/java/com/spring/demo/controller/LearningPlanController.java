package com.spring.demo.controller;

import com.spring.demo.dto.LearningPlanDTO;
import com.spring.demo.service.LearningPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@RestController
@RequestMapping("/api/learning-plans")
public class LearningPlanController {
    
    @Autowired
    private LearningPlanService learningPlanService;
    
    @PostMapping
    public ResponseEntity<LearningPlanDTO> createLearningPlan(
            @RequestBody LearningPlanDTO learningPlanDTO,
            @RequestParam String creatorId) {
        LearningPlanDTO createdPlan = learningPlanService.createLearningPlan(learningPlanDTO, creatorId);
        addLinks(createdPlan);
        return ResponseEntity.ok(createdPlan);
    }
    
    @PutMapping("/{planId}")
    public ResponseEntity<LearningPlanDTO> updateLearningPlan(
            @PathVariable String planId,
            @RequestBody LearningPlanDTO learningPlanDTO) {
        LearningPlanDTO updatedPlan = learningPlanService.updateLearningPlan(planId, learningPlanDTO);
        addLinks(updatedPlan);
        return ResponseEntity.ok(updatedPlan);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LearningPlanDTO>> getUserLearningPlans(@PathVariable String userId) {
        List<LearningPlanDTO> plans = learningPlanService.getUserLearningPlans(userId);
        plans.forEach(this::addLinks);
        return ResponseEntity.ok(plans);
    }
    
    @GetMapping("/public")
    public ResponseEntity<List<LearningPlanDTO>> getPublicLearningPlans() {
        List<LearningPlanDTO> plans = learningPlanService.getPublicLearningPlans();
        plans.forEach(this::addLinks);
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/{planId}")
    public ResponseEntity<LearningPlanDTO> getLearningPlanById(@PathVariable String planId) {
        LearningPlanDTO plan = learningPlanService.getLearningPlanById(planId);
        addLinks(plan);
        return ResponseEntity.ok(plan);
    }

    @DeleteMapping("/{planId}")
    public ResponseEntity<Map<String, String>> deleteLearningPlan(@PathVariable String planId) {
        learningPlanService.deleteLearningPlan(planId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Learning plan deleted successfully");
        return ResponseEntity.ok(response);
    }

    private void addLinks(LearningPlanDTO plan) {
        if (plan.getId() != null) {
            plan.add(linkTo(methodOn(LearningPlanController.class).updateLearningPlan(plan.getId(), plan)).withRel("update"));
        }
        if (plan.getCreatorId() != null) {
            plan.add(linkTo(methodOn(LearningPlanController.class).getUserLearningPlans(plan.getCreatorId())).withRel("user-plans"));
        }
        plan.add(linkTo(methodOn(LearningPlanController.class).getPublicLearningPlans()).withRel("public-plans"));
    }
} 