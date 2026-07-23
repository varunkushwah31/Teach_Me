package com.TeachMe.TeachMe.service;

import java.util.Map;

public interface AudioPodcastService {
    Map<String, Object> generatePodcastScript(Long documentId);
}
