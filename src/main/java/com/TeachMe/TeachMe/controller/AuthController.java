package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> request) {
        // 1. Authenticate the user credentials against Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.get("email"),
                        request.get("password")
                )
        );

        // 2. Fetch the validated user
        UserDetails user = userDetailsService.loadUserByUsername(request.get("email"));

        // 3. Generate the JWT
        String jwtToken = jwtService.generateToken(user);

        // 4. Return the token to the client
        return ResponseEntity.ok(Map.of("token", jwtToken));
    }
}