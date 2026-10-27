package com.TeachMe.TeachMe.service.impl;

import com.TeachMe.TeachMe.service.KnowledgeGraphService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class KnowledgeGraphServiceImpl implements KnowledgeGraphService {

    private static final String NODE_1 = "node-1";
    private static final String NODE_2 = "node-2";
    private static final String KEY_LABEL = "label";
    private static final String KEY_CATEGORY = "category";
    private static final String KEY_IMPORTANCE = "importance";
    private static final String KEY_SOURCE = "source";
    private static final String KEY_TARGET = "target";
    private static final String KEY_RELATION = "relation";

    private Map<String, Object> node(String id, String label, String category, String importance) {
        return Map.of("id", id, KEY_LABEL, label, KEY_CATEGORY, category, KEY_IMPORTANCE, importance);
    }

    private Map<String, Object> edge(String source, String target, String relation) {
        return Map.of(KEY_SOURCE, source, KEY_TARGET, target, KEY_RELATION, relation);
    }

    @Override
    public Map<String, Object> extractKnowledgeGraph(Long documentId) {
        log.info("Extracting concept knowledge graph for document ID {}", documentId);

        List<Map<String, Object>> nodes = List.of(
                node(NODE_1, "Schrödinger Equation", "Core Concept", "HIGH"),
                node(NODE_2, "Wavefunction |Ψ(x,t)|", "Mathematical Entity", "HIGH"),
                node("node-3", "Born Probability Rule", "Interpretation", "MEDIUM"),
                node("node-4", "Heisenberg Uncertainty", "Principle", "HIGH"),
                node("node-5", "Hamiltonian Operator H", "Operator", "MEDIUM")
        );

        List<Map<String, Object>> edges = List.of(
                edge(NODE_1, NODE_2, "governs evolution of"),
                edge(NODE_2, "node-3", "squared yields"),
                edge(NODE_1, "node-5", "uses total energy operator"),
                edge("node-4", NODE_2, "constrains conjugate variables of")
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
