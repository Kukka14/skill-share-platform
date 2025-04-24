package com.spring.demo.service;

import com.spring.demo.dto.LearningProgressDTO;
import com.spring.demo.model.LearningProgress;
import com.spring.demo.repository.LearningProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LearningProgressService {

    @Autowired
    private LearningProgressRepository learningProgressRepository;

    public LearningProgressDTO createProgressUpdate(LearningProgressDTO progressDTO) {
        LearningProgress progress = new LearningProgress();
        progress.setUserId(progressDTO.getUserId());
        progress.setTitle(progressDTO.getTitle());
        progress.setDescription(progressDTO.getDescription());
        progress.setTemplateType(progressDTO.getTemplateType());
        progress.setCompletedItems(progressDTO.getCompletedItems());
        progress.setNewSkills(progressDTO.getNewSkills());
        progress.setCreatedAt(LocalDateTime.now());

        LearningProgress savedProgress = learningProgressRepository.save(progress);
        return convertToDTO(savedProgress);
    }

    public LearningProgressDTO updateProgressUpdate(String id, LearningProgressDTO progressDTO) {
        LearningProgress existingProgress = learningProgressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Learning progress not found with id: " + id));

        // Store old completed items
        String oldCompletedItems = existingProgress.getCompletedItems();
        
        // Update other fields
        existingProgress.setTitle(progressDTO.getTitle());
        existingProgress.setDescription(progressDTO.getDescription());
        existingProgress.setTemplateType(progressDTO.getTemplateType());
        
        // Merge old and new completed items
        if (progressDTO.getCompletedItems() != null && !progressDTO.getCompletedItems().isEmpty()) {
            if (oldCompletedItems != null && !oldCompletedItems.isEmpty()) {
                // If both old and new items exist, combine them with a separator
                existingProgress.setCompletedItems(oldCompletedItems + " | " + progressDTO.getCompletedItems());
            } else {
                // If only new items exist, use them directly
                existingProgress.setCompletedItems(progressDTO.getCompletedItems());
            }
        }
        
        existingProgress.setNewSkills(progressDTO.getNewSkills());

        LearningProgress updatedProgress = learningProgressRepository.save(existingProgress);
        return convertToDTO(updatedProgress);
    }

    public void deleteProgressUpdate(String id) {
        LearningProgress existingProgress = learningProgressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Learning progress not found with id: " + id));
        
        learningProgressRepository.delete(existingProgress);
    }

    public List<LearningProgressDTO> getUserProgressUpdates(String userId) {
        return learningProgressRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LearningProgressDTO> getProgressUpdatesByTemplate(String templateType) {
        return learningProgressRepository.findByTemplateType(templateType)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private LearningProgressDTO convertToDTO(LearningProgress progress) {
        LearningProgressDTO dto = new LearningProgressDTO();
        dto.setId(progress.getId());
        dto.setUserId(progress.getUserId());
        dto.setTitle(progress.getTitle());
        dto.setDescription(progress.getDescription());
        dto.setTemplateType(progress.getTemplateType());
        dto.setCompletedItems(progress.getCompletedItems());
        dto.setNewSkills(progress.getNewSkills());
        dto.setCreatedAt(progress.getCreatedAt());
        return dto;
    }
} 