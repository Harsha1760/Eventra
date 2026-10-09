package com.eventra;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

    static {
        loadDotenv();
    }

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    /**
     * Loads local .env configuration files into Java System properties
     * if they exist and are not already set in the OS environment.
     */
    private static void loadDotenv() {
        String[] candidatePaths = {
            ".env",
            "backend/.env",
            "../backend/.env",
            "../.env"
        };

        for (String pathStr : candidatePaths) {
            File file = new File(pathStr);
            if (file.exists() && file.isFile()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        String key = line.substring(0, eqIdx).trim();
                        String value = line.substring(eqIdx + 1).trim();

                        if ((value.startsWith("\"") && value.endsWith("\""))
                                || (value.startsWith("'") && value.endsWith("'"))) {
                            value = value.substring(1, value.length() - 1);
                        }

                        // Only set if not already defined in OS environment or system properties
                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                    break;
                } catch (Exception ignored) {
                    // Fall back to application.properties defaults if unreadable
                }
            }
        }
    }
}
