package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.entity.RefreshToken;

import org.jspecify.annotations.NonNull;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenService {
    RefreshToken createRefreshToken(Long userId);
    RefreshToken rotateRefreshToken(RefreshToken oldToken);
    @NonNull RefreshToken verifyExpiration(@NonNull RefreshToken token);
    Optional<RefreshToken> findByToken(String token);
    List<RefreshToken> getUserSessions(Long userId);
    void revokeSession(Long sessionId, Long userId);
    void deleteByUserId(Long userId);
}
