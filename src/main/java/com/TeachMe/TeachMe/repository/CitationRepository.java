package com.TeachMe.TeachMe.repository;

import com.TeachMe.TeachMe.entity.Citation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CitationRepository extends JpaRepository<Citation, Long> {
    List<Citation> findByChatId(Long chatId);
}

