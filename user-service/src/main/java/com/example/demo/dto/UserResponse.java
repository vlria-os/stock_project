package com.example.demo.dto;

import com.example.demo.entity.User;
import lombok.Getter;

//내 정보 응답(마이페이지)
@Getter
public class UserResponse {
    private Long id;
    private String email;
    private String name;

    public UserResponse(User user){
        this.id = user.getId();
        this.email = user.getEmail();
        this.name = user.getName();
    }
}
