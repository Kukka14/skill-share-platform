package com.spring.demo.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

@Document(collection = "learning_plans")
@Data
public class LearningPlan {
    @Id
    private String id;
    
    private String title;
    private String description;
    
    @DBRef
    private User creator;
    
    private String creatorId;
    
    private List<Topic> topics;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime targetCompletionDate;
    private boolean isPublic;
    
    @JsonProperty("isPublic")
    public boolean isPublic() {
        return isPublic;
    }

    @JsonProperty("isPublic")
    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }
    
    @Data
    public static class Topic {
        private String name;
        private String description;
        private List<Resource> resources;
        private LocalDateTime targetCompletionDate;
        private boolean isCompleted;
    }
    
    @Data
    public static class Resource {
        private String title;
        private String url;
        private String type; // e.g., "video", "article", "book"
        private String description;
    }
} 