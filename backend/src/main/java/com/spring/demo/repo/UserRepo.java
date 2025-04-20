package com.spring.demo.repo;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.spring.demo.model.Users;

@Repository
public interface UserRepo extends MongoRepository<Users, String> {
}
