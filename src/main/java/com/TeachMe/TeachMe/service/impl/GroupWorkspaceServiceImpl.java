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
    public List<Map<String, Object>> getWorkspaces(Long userId) {
        log.info("Fetching study workspaces for user ID {}", userId);
        return List.of(
                Map.of(
                        "workspaceId", 1L,
                        "name", "CS301 Study Group",
                        "description", "Operating Systems & Concurrency review",
                        "ownerUserId", userId,
                        "members", List.of("student@teachme.ai", "study_partner@college.edu"),
                        "sharedDocumentCount", 2,
                        "createdAt", java.time.LocalDateTime.now().minusDays(3).toString()
                ),
                Map.of(
                        "workspaceId", 2L,
                        "name", "Midterm Prep Room",
                        "description", "Algorithm design & dynamic programming",
                        "ownerUserId", userId,
                        "members", List.of("student@teachme.ai", "peer@college.edu"),
                        "sharedDocumentCount", 1,
                        "createdAt", java.time.LocalDateTime.now().minusDays(1).toString()
                )
        );
    }

    @Override
    public Map<String, Object> createWorkspace(String name, String description, Long ownerUserId) {
        log.info("Creating group study workspace '{}' for user ID {}", name, ownerUserId);

        return Map.of(
                "workspaceId", System.currentTimeMillis(),
                "name", name,
                "description", description,
                "ownerUserId", ownerUserId,
                "members", List.of("student@teachme.ai", "classmate@college.edu"),
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
