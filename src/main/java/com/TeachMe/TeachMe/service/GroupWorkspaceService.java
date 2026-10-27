package com.TeachMe.TeachMe.service;

import java.util.List;
import java.util.Map;

public interface GroupWorkspaceService {
    List<Map<String, Object>> getWorkspaces(Long userId);
    Map<String, Object> createWorkspace(String name, String description, Long ownerUserId);
    Map<String, Object> shareDocumentWithWorkspace(Long workspaceId, Long documentId);
}
