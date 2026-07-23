package com.TeachMe.TeachMe.controller;

import com.TeachMe.TeachMe.dto.DocumentAnalyticsDTO;
import com.TeachMe.TeachMe.entity.User;
import com.TeachMe.TeachMe.repository.DocumentRepository;
import com.TeachMe.TeachMe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentAnalyticsController {

    private final DocumentRepository documentRepository;
    private final VectorStore vectorStore;
    private final UserRepository userRepository;

    @GetMapping("/{documentId}/analytics")
    public ResponseEntity<DocumentAnalyticsDTO> getDocumentAnalytics(
            @PathVariable Long documentId,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {

        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        com.TeachMe.TeachMe.entity.Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found: " + documentId));

        if (!doc.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(403).build();
        }

        SearchRequest request = SearchRequest.builder()
                .topK(100)
                .filterExpression(new FilterExpressionBuilder().eq("dbDocumentId", documentId).build())
                .build();

        List<Document> chunks = vectorStore.similaritySearch(request);
        long totalWords = chunks.stream()
                .mapToLong(c -> c.getText() != null ? c.getText().split("\\s+").length : 0)
                .sum();

        double readingTime = Math.max(1.0, Math.round((totalWords / 200.0) * 10.0) / 10.0);
        String readabilityGrade = calculateFleschKincaid(chunks);
        List<String> topKeywords = extractTopKeywords(chunks);

        DocumentAnalyticsDTO dto = DocumentAnalyticsDTO.builder()
                .documentId(doc.getId())
                .documentName(doc.getFileName())
                .totalWords(totalWords)
                .estimatedReadingTimeMinutes(readingTime)
                .chunkCount(chunks.size())
                .readabilityGradeLevel(readabilityGrade)
                .topExtractedKeywords(topKeywords)
                .build();

        return ResponseEntity.ok(dto);
    }

    private String calculateFleschKincaid(List<Document> chunks) {
        if (chunks.isEmpty()) return "Grade 10 (High School)";
        long sentenceCount = 0;
        long wordCount = 0;
        long syllableCount = 0;

        for (Document c : chunks) {
            String text = c.getText();
            if (text == null) continue;
            String[] sentences = text.split("[.!?]+");
            sentenceCount += sentences.length;
            String[] words = text.split("\\s+");
            wordCount += words.length;
            for (String w : words) {
                syllableCount += countSyllables(w);
            }
        }
        if (sentenceCount == 0 || wordCount == 0) return "College Level";
        double score = 0.39 * ((double) wordCount / sentenceCount) + 11.8 * ((double) syllableCount / wordCount) - 15.59;
        int grade = (int) Math.round(score);
        if (grade <= 8) return "Grade 8 (Middle School)";
        if (grade <= 12) return "Grade " + grade + " (High School)";
        return "College & Academic Level";
    }

    private int countSyllables(String word) {
        word = word.toLowerCase().replaceAll("[^a-z]", "");
        if (word.length() <= 3) return 1;
        word = word.replaceAll("(?:[^laeiouy]es|ed|[^laeiouy]e)$", "");
        word = word.replaceAll("^y", "");
        String[] matches = word.split("[aeiouy]+");
        return Math.max(1, matches.length - 1);
    }

    private List<String> extractTopKeywords(List<Document> chunks) {
        Map<String, Integer> freq = new HashMap<>();
        Set<String> stopWords = Set.of("the", "and", "is", "for", "with", "that", "this", "from", "have", "are", "was", "were", "not", "which", "will");
        for (Document c : chunks) {
            if (c.getText() == null) continue;
            String[] words = c.getText().toLowerCase().split("[\\s\\p{Punct}]+");
            for (String w : words) {
                if (w.length() > 4 && !stopWords.contains(w)) {
                    freq.put(w, freq.getOrDefault(w, 0) + 1);
                }
            }
        }
        return freq.entrySet().stream()
                .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                .limit(6)
                .map(Map.Entry::getKey)
                .toList();
    }
}
