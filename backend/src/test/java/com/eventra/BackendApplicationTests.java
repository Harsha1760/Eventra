package com.eventra;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.eventra.security.JwtService;

@SpringBootTest
class BackendApplicationTests {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void contextLoads() {
        assertNotNull(jwtService);
        assertNotNull(passwordEncoder);
    }

    @Test
    void testJwtTokenGenerationAndClaims() {
        String email = "testunit@eventra.com";
        String role = "USER";
        Long userId = 99L;

        String token = jwtService.generateToken(email, role, userId);
        assertNotNull(token);
        assertFalse(token.isBlank());

        assertEquals(email, jwtService.extractEmail(token));
        assertEquals(role, jwtService.extractRole(token));
        assertEquals(userId, jwtService.extractUserId(token));
        assertTrue(jwtService.isTokenValid(token, email));
        assertFalse(jwtService.isTokenExpired(token));
    }

    @Test
    void testBCryptPasswordHashing() {
        String rawPassword = "mySecurePassword123";
        String encoded = passwordEncoder.encode(rawPassword);

        assertNotNull(encoded);
        assertTrue(passwordEncoder.matches(rawPassword, encoded));
        assertFalse(passwordEncoder.matches("wrongPassword", encoded));
    }
}
