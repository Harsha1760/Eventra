package com.eventra.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.eventra.entity.User;
import com.eventra.exception.EmailAlreadyExistsException;
import com.eventra.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

  public User registerUser(User user) {

    Optional<User> existingUser =
            userRepository.findByEmail(user.getEmail());

    if (existingUser.isPresent()) {
        throw new EmailAlreadyExistsException("Email already registered");
    }

    user.setRole("USER");

    return userRepository.save(user);
}
}