package com.spring.demo.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.util.HashSet;
import java.util.Set;

@Document(collection = "users")
@Data
public class User {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String username;
    
    @Indexed(unique = true)
    private String email;
    
    private String password;
    private String firstName;
    private String lastName;
    private String bio;
    private String profileImageUrl;  // Stores path like "/profile-images/user123.jpg"

    private Set<String> followers = new HashSet<>();  // List of user IDs following this user
    private Set<String> following = new HashSet<>();  // List of user IDs this user is following
}
