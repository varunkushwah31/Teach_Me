package com.TeachMe.TeachMe.repository;

import com.TeachMe.TeachMe.entity.Citation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CitationRepository extends JpaRepository<Citation, Long> {
    List<Citation> findByChatId(Long chatId);
}

