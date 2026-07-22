package com.TeachMe.TeachMe.service.impl;

import com.TeachMe.TeachMe.entity.RefreshToken;
import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.RefreshTokenRepository;
import com.TeachMe.TeachMe.repository.UserRepository;
import com.TeachMe.TeachMe.service.RefreshTokenService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.BadCredentialsException;

@Slf4j
@Service
@Transactional(readOnly = true)
public class RefreshTokenServiceImpl implements RefreshTokenService {

    @Value("${application.security.jwt.refresh-token-expiration:604800000}")
    private long refreshExpiration;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final RefreshTokenService self;

    public RefreshTokenServiceImpl(RefreshTokenRepository refreshTokenRepository,
                                   UserRepository userRepository,
                                   @Lazy RefreshTokenService self) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.self = self;
    }

    @Override
    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshExpiration))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    @Transactional
    public RefreshToken rotateRefreshToken(RefreshToken oldToken) {
        self.verifyExpiration(oldToken);

        oldToken.setRevoked(true);
        refreshTokenRepository.save(oldToken);

        RefreshToken rotatedToken = RefreshToken.builder()
                .user(oldToken.getUser())
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshExpiration))
                .revoked(false)
                .build();

        return refreshTokenRepository.save(rotatedToken);
    }

    @Override
    @Transactional
    public @NonNull RefreshToken verifyExpiration(@NonNull RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new BadCredentialsException("Refresh token was expired. Please sign in again.");
        }
        if (token.isRevoked()) {
            Long userId = token.getUser().getId();
            log.error("SECURITY BREACH ALERT: Attempted reuse of revoked refresh token {} for user ID {}. Invalidation trigger activated across all devices!", token.getId(), userId);
            refreshTokenRepository.deleteByUserId(userId);
            throw new BadCredentialsException("Security breach detected: Revoked token reuse attempt. All active device sessions have been invalidated.");
        }
        return token;
    }

    @Override
    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Override
    public List<RefreshToken> getUserSessions(Long userId) {
        return refreshTokenRepository.findByUserId(userId);
    }

    @Override
    @Transactional
    public void revokeSession(Long sessionId, Long userId) {
        refreshTokenRepository.deleteByIdAndUserId(sessionId, userId);
    }

    @Override
    @Transactional
    public void deleteByUserId(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }
}