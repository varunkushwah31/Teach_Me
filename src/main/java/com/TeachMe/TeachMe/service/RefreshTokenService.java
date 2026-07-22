package com.TeachMe.TeachMe.service;

import com.TeachMe.TeachMe.entity.RefreshToken;

import org.jspecify.annotations.NonNull;
import java.util.Optional;

public interface RefreshTokenService {
    RefreshToken createRefreshToken(Long userId);
    @NonNull RefreshToken verifyExpiration(@NonNull RefreshToken token);
    Optional<RefreshToken> findByToken(String token);
    void deleteByUserId(Long userId);
}
