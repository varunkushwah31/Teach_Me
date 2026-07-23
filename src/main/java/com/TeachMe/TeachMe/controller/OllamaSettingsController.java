package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.service.OllamaConnectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ollama")
@RequiredArgsConstructor
@Tag(name = "Ollama Management", description = "Endpoints for testing custom Ollama connections and fetching installed models.")
public class OllamaSettingsController {

    private final OllamaConnectionService connectionService;

    @PostMapping("/test-connection")
    @Operation(summary = "Test Ollama connection", description = "Pings a custom Ollama server URL to test reachability, latency, and daemon version.")
    @ApiResponse(responseCode = "200", description = "Connection test completed")
    public ResponseEntity<Map<String, Object>> testConnection(@RequestBody Map<String, String> request) {
        String baseUrl = request.getOrDefault("baseUrl", "http://localhost:11434");
        Map<String, Object> result = connectionService.testConnection(baseUrl);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/models")
    @Operation(summary = "List installed Ollama models", description = "Retrieves all pulled GGUF models directly from the target Ollama instance.")
    @ApiResponse(responseCode = "200", description = "Models list retrieved successfully")
    public ResponseEntity<List<Map<String, Object>>> getAvailableModels(
            @RequestParam(name = "baseUrl", defaultValue = "http://localhost:11434") String baseUrl) {
        List<Map<String, Object>> models = connectionService.fetchAvailableModels(baseUrl);
        return ResponseEntity.ok(models);
    }
}
