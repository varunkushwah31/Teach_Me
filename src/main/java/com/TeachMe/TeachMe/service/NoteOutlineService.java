package com.TeachMe.TeachMe.service;

import java.util.Map;

public interface NoteOutlineService {
    Map<String, Object> generateOutline(Long documentId);
}
