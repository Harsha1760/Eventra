package com.eventra.service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.eventra.entity.User;
import com.eventra.exception.EmailAlreadyExistsException;
import com.eventra.repository.BookingRepository;
import com.eventra.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            BookingRepository bookingRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user) {

        Optional<User> existingUser =
                userRepository.findByEmail(user.getEmail());

        if (existingUser.isPresent()) {
            throw new EmailAlreadyExistsException(
                    "Email already registered");
        }

        user.setRole("USER");

        // Hash password before saving to database
        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() ->
                        new NoSuchElementException(
                                "User not found with ID: " + id));
    }

    public User updateUser(Long id, User updatedUser) {

        User existingUser = getUserById(id);

        Optional<User> userWithEmail =
                userRepository.findByEmail(updatedUser.getEmail());

        if (userWithEmail.isPresent()
                && !userWithEmail.get().getId().equals(id)) {

            throw new EmailAlreadyExistsException(
                    "Email already registered");
        }

        existingUser.setName(updatedUser.getName());
        existingUser.setEmail(updatedUser.getEmail());

        return userRepository.save(existingUser);
    }

    public void deleteUser(Long id) {

        User user = getUserById(id);

        if (bookingRepository.existsByUserId(id)) {
            throw new IllegalStateException(
                    "Cannot delete a user with booking history");
        }

        userRepository.delete(user);
    }
}