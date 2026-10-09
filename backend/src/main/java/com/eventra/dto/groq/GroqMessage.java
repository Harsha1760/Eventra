package com.eventra.dto.groq;

public record GroqMessage(
        String role,
        String content
) {
}

