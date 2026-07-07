package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.entity.RefreshToken;
import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.UserRepository;
import com.TeachMe.TeachMe.security.CustomUserDetailsService;
import com.TeachMe.TeachMe.security.JwtService;
import com.TeachMe.TeachMe.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user registration and JWT-based login authentication.")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private static final String EMAIL = "email";

    @PostMapping("/login")
    @Operation(summary = "Authenticate user", description = "Verifies user credentials and returns an access JWT and a refresh token.")
    @ApiResponse(responseCode = "200", description = "Successful authentication")
    @ApiResponse(responseCode = "401", description = "Invalid credentials")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.get(EMAIL),
                        request.get("password")
                )
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.get(EMAIL));
        String jwtToken = jwtService.generateToken(userDetails);
        User user = userRepository.findByEmail(request.get(EMAIL))
                .orElseThrow(() -> new RuntimeException("User not found"));
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return ResponseEntity.ok(Map.of(
                "token", jwtToken,
                "refreshToken", refreshToken.getToken()
        ));
    }

    @PostMapping("/register")
    @Operation(summary = "Register user", description = "Registers a new user account and returns the authenticated JWT and refresh token.")
    @ApiResponse(responseCode = "200", description = "Successful registration")
    @ApiResponse(responseCode = "409", description = "User already exists")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String email = request.get(EMAIL);
            String rawPassword = request.get("password");

            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "User already exists"));
            }

            // Create your JPA Entity
            User newUser = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .firstName(request.getOrDefault("firstName", "New"))
                    .lastName(request.getOrDefault("lastName", "User"))
                    .build();

            // Save directly to PostgreSQL
            User savedUser = userRepository.save(newUser);

            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            String jwtToken = jwtService.generateToken(userDetails);
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser.getId());

            return ResponseEntity.ok(Map.of(
                    "token", jwtToken,
                    "refreshToken", refreshToken.getToken()
            ));

        } catch (Exception e) {
            log.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Registration failed. Please try again."));
        }
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh JWT", description = "Trades an active refresh token for a newly rotated access token and new refresh token.")
    @ApiResponse(responseCode = "200", description = "Successful rotation")
    @ApiResponse(responseCode = "401", description = "Invalid or expired refresh token")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> request) {
        String tokenStr = request.get("refreshToken");
        if (tokenStr == null || tokenStr.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Refresh token is missing"));
        }

        try {
            return refreshTokenService.findByToken(tokenStr)
                    .map(refreshTokenService::verifyExpiration)
                    .map(RefreshToken::getUser)
                    .map(user -> {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
                        String accessToken = jwtService.generateToken(userDetails);
                        RefreshToken rotatedRefreshToken = refreshTokenService.createRefreshToken(user.getId());
                        return ResponseEntity.ok(Map.of(
                                "token", accessToken,
                                "refreshToken", rotatedRefreshToken.getToken()
                        ));
                    })
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("message", "Refresh token not found in database")));
        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    @Operation(summary = "Log out user", description = "Revokes and deletes the user's active refresh tokens.")
    @ApiResponse(responseCode = "200", description = "Logged out successfully")
    public ResponseEntity<?> logout(@RequestBody(required = false) Map<String, String> request) {
        try {
            if (request != null && request.containsKey("refreshToken")) {
                String tokenStr = request.get("refreshToken");
                refreshTokenService.findByToken(tokenStr).ifPresent(token -> {
                    refreshTokenService.deleteByUserId(token.getUser().getId());
                });
            } else {
                org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                    userRepository.findByEmail(auth.getName()).ifPresent(user -> refreshTokenService.deleteByUserId(user.getId()));
                }
            }
            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
        } catch (Exception e) {
            log.error("Logout failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}