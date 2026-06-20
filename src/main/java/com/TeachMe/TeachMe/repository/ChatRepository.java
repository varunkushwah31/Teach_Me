package com.TeachMe.TeachMe.repository;

import com.TeachMe.TeachMe.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    List<Chat> findByUserId(Long userId);
    List<Chat> findByDocumentId(Long documentId);
    List<Chat> findBySessionId(String sessionId);
    List<Chat> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Chat> findByDocumentIdOrderByCreatedAtDesc(Long documentId);
}
