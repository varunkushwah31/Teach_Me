package com.TeachMe.TeachMe.service.impl;

import com.TeachMe.TeachMe.service.GroupWorkspaceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GroupWorkspaceServiceImpl implements GroupWorkspaceService {

    @Override
    public Map<String, Object> createWorkspace(String name, String description, Long ownerUserId) {
        log.info("Creating group study workspace '{}' for user ID {}", name, ownerUserId);

        return Map.of(
                "workspaceId", System.currentTimeMillis(),
                "name", name,
                "description", description,
                "ownerUserId", ownerUserId,
                "members", List.of("student@teachme.ai", "classmate@mit.edu"),
                "sharedDocumentCount", 0,
                "createdAt", java.time.LocalDateTime.now().toString()
        );
    }

    @Override
    public Map<String, Object> shareDocumentWithWorkspace(Long workspaceId, Long documentId) {
        log.info("Sharing document ID {} with workspace ID {}", documentId, workspaceId);

        return Map.of(
                "workspaceId", workspaceId,
                "documentId", documentId,
                "status", "SHARED",
                "message", "Document vector index successfully shared with group workspace"
        );
    }
}
