package com.spring.demo.dto;

//import lombok.Data;

//@Data
public class LoginRequest {
    private String username;
    private String password;


    
    // Getter and Setter for username--->>added by nethmi
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    // Getter and Setter for password
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}