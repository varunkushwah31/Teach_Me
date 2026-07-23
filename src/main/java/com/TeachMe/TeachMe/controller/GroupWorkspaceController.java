package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.service.AuthService;
import com.TeachMe.TeachMe.service.GroupWorkspaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
@Tag(name = "Group Workspace Controller", description = "Group Study Workspaces & Vector Sharing Endpoints")
public class GroupWorkspaceController {

    private final GroupWorkspaceService groupWorkspaceService;
    private final AuthService authService;

    @PostMapping("/create")
    @Operation(summary = "Create Group Workspace", description = "Creates a new shared study workspace for collaborating on course documents")
    public ResponseEntity<Map<String, Object>> createWorkspace(
            @RequestParam String name,
            @RequestParam(defaultValue = "Study Group Workspace") String description) {
        Long userId = authService.getAuthenticatedUserId();
        return ResponseEntity.ok(groupWorkspaceService.createWorkspace(name, description, userId));
    }

    @PostMapping("/{workspaceId}/share/{documentId}")
    @Operation(summary = "Share Document with Workspace", description = "Shares document vector indices with all members of a study workspace")
    public ResponseEntity<Map<String, Object>> shareDocument(
            @PathVariable Long workspaceId,
            @PathVariable Long documentId) {
        return ResponseEntity.ok(groupWorkspaceService.shareDocumentWithWorkspace(workspaceId, documentId));
    }
}
