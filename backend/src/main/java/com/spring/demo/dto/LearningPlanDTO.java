package com.spring.demo.dto;

import lombok.Data;
import org.springframework.hateoas.RepresentationModel;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class LearningPlanDTO extends RepresentationModel<LearningPlanDTO> {
    private String id;
    private String title;
    private String description;
    private String creatorId;
    private List<TopicDTO> topics;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime targetCompletionDate;
    private boolean isPublic;
    
    @Data
    public static class TopicDTO {
        private String name;
        private String description;
        private List<ResourceDTO> resources;
        private LocalDateTime targetCompletionDate;
        private boolean isCompleted;
    }
    
    @Data
    public static class ResourceDTO {
        private String title;
        private String url;
        private String type;
        private String description;
    }
} 