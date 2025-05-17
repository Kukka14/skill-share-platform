package com.spring.demo.service;

import com.spring.demo.dto.LearningPlanDTO;
import com.spring.demo.model.LearningPlan;
import com.spring.demo.model.User;
import com.spring.demo.repository.LearningPlanRepository;
import com.spring.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

//added by nethmi 
import com.spring.demo.model.Notification;
import com.spring.demo.repository.NotificationRepository;

@Service
public class LearningPlanService {
    
    @Autowired
    private LearningPlanRepository learningPlanRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    
    public LearningPlanDTO createLearningPlan(LearningPlanDTO learningPlanDTO, String creatorId) {
        User creator = userRepository.findById(creatorId)
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        LearningPlan learningPlan = new LearningPlan();
        learningPlan.setTitle(learningPlanDTO.getTitle());
        learningPlan.setDescription(learningPlanDTO.getDescription());
        learningPlan.setCreator(creator);
        learningPlan.setCreatorId(creatorId);
        learningPlan.setCreatedAt(LocalDateTime.now());
        learningPlan.setUpdatedAt(LocalDateTime.now());
        learningPlan.setTargetCompletionDate(learningPlanDTO.getTargetCompletionDate());
        learningPlan.setPublic(learningPlanDTO.isPublic());
        
        // Convert and set topics
        learningPlan.setTopics(learningPlanDTO.getTopics().stream()
            .map(topicDTO -> {
                LearningPlan.Topic topic = new LearningPlan.Topic();
                topic.setName(topicDTO.getName());
                topic.setDescription(topicDTO.getDescription());
                topic.setTargetCompletionDate(topicDTO.getTargetCompletionDate());
                topic.setCompleted(topicDTO.isCompleted());
                
                // Convert and set resources
                topic.setResources(topicDTO.getResources().stream()
                    .map(resourceDTO -> {
                        LearningPlan.Resource resource = new LearningPlan.Resource();
                        resource.setTitle(resourceDTO.getTitle());
                        resource.setUrl(resourceDTO.getUrl());
                        resource.setType(resourceDTO.getType());
                        resource.setDescription(resourceDTO.getDescription());
                        return resource;
                    })
                    .collect(Collectors.toList()));
                return topic;
            })
            .collect(Collectors.toList()));
            
        // LearningPlan savedPlan = learningPlanRepository.save(learningPlan);
        // return convertToDTO(savedPlan);

        LearningPlan savedPlan = learningPlanRepository.save(learningPlan);

            // ✨ Create Notification
            Notification notification = new Notification();
            notification.setUserId(creator.getId());
            notification.setUsername(creator.getUsername());
            notification.setDescription(creator.getUsername() + " created a new learning plan.");
            notification.setRead(false);
            notification.setTimestamp(LocalDateTime.now());

            notificationRepository.save(notification);

            return convertToDTO(savedPlan);

    }
    
    public LearningPlanDTO updateLearningPlan(String planId, LearningPlanDTO learningPlanDTO) {
        LearningPlan existingPlan = learningPlanRepository.findById(planId)
            .orElseThrow(() -> new RuntimeException("Learning plan not found"));
            
        existingPlan.setTitle(learningPlanDTO.getTitle());
        existingPlan.setDescription(learningPlanDTO.getDescription());
        existingPlan.setUpdatedAt(LocalDateTime.now());
        existingPlan.setTargetCompletionDate(learningPlanDTO.getTargetCompletionDate());
        existingPlan.setPublic(learningPlanDTO.isPublic());
        
        // Update topics
        existingPlan.setTopics(learningPlanDTO.getTopics().stream()
            .map(topicDTO -> {
                LearningPlan.Topic topic = new LearningPlan.Topic();
                topic.setName(topicDTO.getName());
                topic.setDescription(topicDTO.getDescription());
                topic.setTargetCompletionDate(topicDTO.getTargetCompletionDate());
                topic.setCompleted(topicDTO.isCompleted());
                
                topic.setResources(topicDTO.getResources().stream()
                    .map(resourceDTO -> {
                        LearningPlan.Resource resource = new LearningPlan.Resource();
                        resource.setTitle(resourceDTO.getTitle());
                        resource.setUrl(resourceDTO.getUrl());
                        resource.setType(resourceDTO.getType());
                        resource.setDescription(resourceDTO.getDescription());
                        return resource;
                    })
                    .collect(Collectors.toList()));
                return topic;
            })
            .collect(Collectors.toList()));
            
        LearningPlan updatedPlan = learningPlanRepository.save(existingPlan);
        return convertToDTO(updatedPlan);
    }
    
    public List<LearningPlanDTO> getUserLearningPlans(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return learningPlanRepository.findByCreatorId(userId).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public List<LearningPlanDTO> getPublicLearningPlans() {
        return learningPlanRepository.findByIsPublicTrue().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public LearningPlanDTO getLearningPlanById(String planId) {
        LearningPlan plan = learningPlanRepository.findById(planId)
            .orElseThrow(() -> new RuntimeException("Learning plan not found"));
        return convertToDTO(plan);
    }
    
    public void deleteLearningPlan(String planId) {
        if (!learningPlanRepository.existsById(planId)) {
            throw new RuntimeException("Learning plan not found");
        }
        learningPlanRepository.deleteById(planId);
    }
    
    private LearningPlanDTO convertToDTO(LearningPlan learningPlan) {
        LearningPlanDTO dto = new LearningPlanDTO();
        dto.setId(learningPlan.getId());
        dto.setTitle(learningPlan.getTitle());
        dto.setDescription(learningPlan.getDescription());
        dto.setCreatorId(learningPlan.getCreator().getId());
        dto.setCreatedAt(learningPlan.getCreatedAt());
        dto.setUpdatedAt(learningPlan.getUpdatedAt());
        dto.setTargetCompletionDate(learningPlan.getTargetCompletionDate());
        dto.setPublic(learningPlan.isPublic());
        
        dto.setTopics(learningPlan.getTopics().stream()
            .map(topic -> {
                LearningPlanDTO.TopicDTO topicDTO = new LearningPlanDTO.TopicDTO();
                topicDTO.setName(topic.getName());
                topicDTO.setDescription(topic.getDescription());
                topicDTO.setTargetCompletionDate(topic.getTargetCompletionDate());
                topicDTO.setCompleted(topic.isCompleted());
                
                topicDTO.setResources(topic.getResources().stream()
                    .map(resource -> {
                        LearningPlanDTO.ResourceDTO resourceDTO = new LearningPlanDTO.ResourceDTO();
                        resourceDTO.setTitle(resource.getTitle());
                        resourceDTO.setUrl(resource.getUrl());
                        resourceDTO.setType(resource.getType());
                        resourceDTO.setDescription(resource.getDescription());
                        return resourceDTO;
                    })
                    .collect(Collectors.toList()));
                return topicDTO;
            })
            .collect(Collectors.toList()));
            
        return dto;
    }
} 