package com.spring.demo.dto;

public class CommentRequest {
    private String content;

    // Default constructor for Jackson
    public CommentRequest() {
    }

    public CommentRequest(String content) {
        this.content = content;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    @Override
    public String toString() {
        return "CommentRequest{content='" + content + "'}";
    }
}
