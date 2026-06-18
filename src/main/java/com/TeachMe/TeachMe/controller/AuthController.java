package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    // Upgraded from UserDetailsService to UserDetailsManager to support user creation
    private final UserDetailsManager userDetailsManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.get("email"),
                        request.get("password")
                )
        );

        UserDetails user = userDetailsManager.loadUserByUsername(request.get("email"));
        String jwtToken = jwtService.generateToken(user);
        return ResponseEntity.ok(Map.of("token", jwtToken));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String rawPassword = request.get("password");

            // Prevent duplicate accounts
            if (userDetailsManager.userExists(email)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "User already exists"));
            }

            // Hash the password
            String encodedPassword = passwordEncoder.encode(rawPassword);

            // ✅ The encodedPassword is now actively used to construct the new user
            UserDetails newUser = User.builder()
                    .username(email)
                    .password(encodedPassword)
                    .roles("USER") // Assign a default role
                    .build();

            // Save the user directly to PostgreSQL
            userDetailsManager.createUser(newUser);

            // Generate the JWT for the new user
            String jwtToken = jwtService.generateToken(newUser);

            return ResponseEntity.ok(Map.of("token", jwtToken));

        } catch (Exception e) {
            System.err.println("Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed. Please try again."));
        }
    }
}