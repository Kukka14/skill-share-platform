package com.spring.demo.controller;

import com.spring.demo.dto.LearningProgressDTO;
import com.spring.demo.service.LearningProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.CollectionModel;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

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
    public ResponseEntity<?> createProgressUpdate(@RequestBody LearningProgressDTO progressDTO) {
        LearningProgressDTO createdProgress = learningProgressService.createProgressUpdate(progressDTO);
        EntityModel<LearningProgressDTO> resource = EntityModel.of(createdProgress,
            linkTo(methodOn(LearningProgressController.class).createProgressUpdate(progressDTO)).withSelfRel(),
            linkTo(methodOn(LearningProgressController.class).getUserProgressUpdates(createdProgress.getUserId())).withRel("user-progress"),
            linkTo(methodOn(LearningProgressController.class).updateProgressUpdate(createdProgress.getId(), null)).withRel("update"),
            linkTo(methodOn(LearningProgressController.class).deleteProgressUpdate(createdProgress.getId())).withRel("delete")
        );
        return ResponseEntity.ok(resource);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProgressUpdate(
            @PathVariable String id,
            @RequestBody LearningProgressDTO progressDTO) {
        try {
            LearningProgressDTO updatedProgress = learningProgressService.updateProgressUpdate(id, progressDTO);
            EntityModel<LearningProgressDTO> resource = EntityModel.of(updatedProgress,
                linkTo(methodOn(LearningProgressController.class).updateProgressUpdate(id, progressDTO)).withSelfRel(),
                linkTo(methodOn(LearningProgressController.class).getUserProgressUpdates(updatedProgress.getUserId())).withRel("user-progress"),
                linkTo(methodOn(LearningProgressController.class).deleteProgressUpdate(id)).withRel("delete")
            );
            return ResponseEntity.ok(resource);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProgressUpdate(@PathVariable String id) {
        try {
            learningProgressService.deleteProgressUpdate(id);
            EntityModel<String> resource = EntityModel.of("Learning progress deleted successfully",
                linkTo(methodOn(LearningProgressController.class).getUserProgressUpdates(null)).withRel("user-progress")
            );
            return ResponseEntity.ok(resource);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserProgressUpdates(@PathVariable String userId) {
        List<LearningProgressDTO> progressUpdates = learningProgressService.getUserProgressUpdates(userId);
        List<EntityModel<LearningProgressDTO>> resources = progressUpdates.stream().map(progress ->
            EntityModel.of(progress,
                linkTo(methodOn(LearningProgressController.class).getUserProgressUpdates(userId)).withSelfRel(),
                linkTo(methodOn(LearningProgressController.class).updateProgressUpdate(progress.getId(), null)).withRel("update"),
                linkTo(methodOn(LearningProgressController.class).deleteProgressUpdate(progress.getId())).withRel("delete")
            )
        ).toList();
        CollectionModel<EntityModel<LearningProgressDTO>> collectionModel = CollectionModel.of(resources,
            linkTo(methodOn(LearningProgressController.class).getUserProgressUpdates(userId)).withSelfRel()
        );
        return ResponseEntity.ok(collectionModel);
    }

    @GetMapping("/template/{templateType}")
    public ResponseEntity<?> getProgressUpdatesByTemplate(@PathVariable String templateType) {
        List<LearningProgressDTO> progressUpdates = learningProgressService.getProgressUpdatesByTemplate(templateType);
        List<EntityModel<LearningProgressDTO>> resources = progressUpdates.stream().map(progress ->
            EntityModel.of(progress,
                linkTo(methodOn(LearningProgressController.class).getProgressUpdatesByTemplate(templateType)).withSelfRel(),
                linkTo(methodOn(LearningProgressController.class).updateProgressUpdate(progress.getId(), null)).withRel("update"),
                linkTo(methodOn(LearningProgressController.class).deleteProgressUpdate(progress.getId())).withRel("delete")
            )
        ).toList();
        CollectionModel<EntityModel<LearningProgressDTO>> collectionModel = CollectionModel.of(resources,
            linkTo(methodOn(LearningProgressController.class).getProgressUpdatesByTemplate(templateType)).withSelfRel()
        );
        return ResponseEntity.ok(collectionModel);
    }
} 