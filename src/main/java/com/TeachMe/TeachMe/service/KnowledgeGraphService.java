package com.TeachMe.TeachMe.service;

import java.util.Map;

public interface KnowledgeGraphService {
    Map<String, Object> extractKnowledgeGraph(Long documentId);
}
