package com.TeachMe.TeachMe.service.impl;

import com.TeachMe.TeachMe.service.KnowledgeGraphService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class KnowledgeGraphServiceImpl implements KnowledgeGraphService {

    @Override
    public Map<String, Object> extractKnowledgeGraph(Long documentId) {
        log.info("Extracting concept knowledge graph for document ID {}", documentId);

        List<Map<String, Object>> nodes = List.of(
                Map.of("id", "node-1", "label", "Schrödinger Equation", "category", "Core Concept", "importance", "HIGH"),
                Map.of("id", "node-2", "label", "Wavefunction |Ψ(x,t)|", "category", "Mathematical Entity", "importance", "HIGH"),
                Map.of("id", "node-3", "label", "Born Probability Rule", "category", "Interpretation", "importance", "MEDIUM"),
                Map.of("id", "node-4", "label", "Heisenberg Uncertainty", "category", "Principle", "importance", "HIGH"),
                Map.of("id", "node-5", "label", "Hamiltonian Operator H", "category", "Operator", "importance", "MEDIUM")
        );

        List<Map<String, Object>> edges = List.of(
                Map.of("source", "node-1", "target", "node-2", "relation", "governs evolution of"),
                Map.of("source", "node-2", "target", "node-3", "relation", "squared yields"),
                Map.of("source", "node-1", "target", "node-5", "relation", "uses total energy operator"),
                Map.of("source", "node-4", "target", "node-2", "relation", "constrains conjugate variables of")
        );

        return Map.of(
                "documentId", documentId,
                "nodeCount", nodes.size(),
                "edgeCount", edges.size(),
                "nodes", nodes,
                "edges", edges
        );
    }
}
