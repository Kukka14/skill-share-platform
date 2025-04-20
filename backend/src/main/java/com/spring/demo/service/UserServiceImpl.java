package com.spring.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.spring.demo.model.Users;
import com.spring.demo.repo.UserRepo;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepo userRepo;

    @Override
    public String save(Users users) {
        Users savedUser = userRepo.save(users);
        return "User saved with ID: " + savedUser.getId();
    }
}