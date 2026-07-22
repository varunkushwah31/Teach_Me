package com.TeachMe.TeachMe.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "flashcard_review_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashcardReviewLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flashcard_id", nullable = false)
    private Flashcard flashcard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer rating; // Quality score (0 to 5)

    @Column(name = "previous_interval", nullable = false)
    private Integer previousInterval;

    @Column(name = "new_interval", nullable = false)
    private Integer newInterval;

    @Column(name = "previous_ease_factor", nullable = false)
    private Double previousEaseFactor;

    @Column(name = "new_ease_factor", nullable = false)
    private Double newEaseFactor;

    @CreationTimestamp
    @Column(name = "reviewed_at", nullable = false, updatable = false)
    private LocalDateTime reviewedAt;
}
