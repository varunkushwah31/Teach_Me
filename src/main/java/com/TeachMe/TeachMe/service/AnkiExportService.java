package com.TeachMe.TeachMe.service;

public interface AnkiExportService {
    byte[] exportFlashcardsToAnkiCsv(Long userId, String deckName);
}
