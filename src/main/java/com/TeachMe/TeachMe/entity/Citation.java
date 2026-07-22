package com.TeachMe.TeachMe.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.proxy.HibernateProxy;

import java.util.Objects;

@Entity
@Table(name = "citations")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Citation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    @ToString.Exclude
    private Chat chat;

    @Column(nullable = false)
    private Integer citationIndex;

    @Column(nullable = false)
    private String documentName;

    @Column(name = "page_number")
    private Integer pageNumber;

    @Column(columnDefinition = "TEXT")
    private String quote;

    @Column(columnDefinition = "TEXT")
    private String sourceChunkId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;

        Class<?> oEffectiveClass = o instanceof HibernateProxy hibernateProxy ? hibernateProxy.getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy hibernateProxy ? hibernateProxy.getHibernateLazyInitializer().getPersistentClass() : this.getClass();

        if (thisEffectiveClass != oEffectiveClass) return false;
        Citation citation = (Citation) o;
        return getId() != null && Objects.equals(getId(), citation.getId());
    }

    @Override
    public int hashCode() {
        return this instanceof HibernateProxy hibernateProxy ? hibernateProxy.getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}