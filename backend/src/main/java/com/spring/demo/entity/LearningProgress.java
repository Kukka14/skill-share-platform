package com.spring.demo.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Document(collection = "learning_progress")
@Data
public class LearningProgress {
    @Id
    private String id;

    @Field("user_id")
    @Indexed
    private String userId;

    @Field("title")
    private String title;

    @Field("description")
    private String description;

    @Field("template_type")
    @Indexed
    private String templateType;

    @Field("completed_items")
    private String completedItems;

    @Field("new_skills")
    private String newSkills;

    @Field("created_at")
    private LocalDateTime createdAt;
} 