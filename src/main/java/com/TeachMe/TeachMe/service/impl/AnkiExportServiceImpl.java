package com.TeachMe.TeachMe.service.impl;

import com.TeachMe.TeachMe.entity.Flashcard;
import com.TeachMe.TeachMe.repository.FlashcardRepository;
import com.TeachMe.TeachMe.service.AnkiExportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnkiExportServiceImpl implements AnkiExportService {

    private final FlashcardRepository flashcardRepository;

    @Override
    public byte[] exportFlashcardsToAnkiCsv(Long userId, String deckName) {
        List<Flashcard> cards;
        if (deckName != null && !deckName.isBlank() && !"All".equalsIgnoreCase(deckName)) {
            cards = flashcardRepository.findByUserIdAndDeckName(userId, deckName);
        } else {
            cards = flashcardRepository.findByUserId(userId);
        }

        StringBuilder sb = new StringBuilder();
        sb.append("#separator:tab\n");
        sb.append("#html:false\n");
        sb.append("#deck:").append(deckName != null ? deckName : "TeachMe AI Deck").append("\n");

        for (Flashcard card : cards) {
            String front = sanitizeForCsv(card.getFront());
            String back = sanitizeForCsv(card.getBack());
            sb.append(front).append("\t").append(back).append("\n");
        }

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String sanitizeForCsv(String text) {
        if (text == null) return "";
        return text.replace("\t", " ").replace("\n", "<br>");
    }
}
