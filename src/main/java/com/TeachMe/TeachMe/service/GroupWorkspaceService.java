package com.TeachMe.TeachMe.service;

import java.util.Map;

public interface GroupWorkspaceService {
    Map<String, Object> createWorkspace(String name, String description, Long ownerUserId);
    Map<String, Object> shareDocumentWithWorkspace(Long workspaceId, Long documentId);
}
