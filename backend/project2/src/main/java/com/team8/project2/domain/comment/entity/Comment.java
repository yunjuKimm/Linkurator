package com.team8.project2.domain.comment.entity;

import com.team8.project2.domain.curation.curation.entity.Curation;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 댓글(Comment) 엔티티 클래스입니다.
 * 각 댓글은 특정 큐레이션(Curation)과 연관되며, 작성자 ID 및 내용 정보를 포함합니다.
 */
@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    /**
     * 댓글의 고유 ID (자동 생성)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 댓글 작성자의 사용자 ID
     */
    @Column(nullable = false)
    private Long memberId;

    /**
     * 댓글이 속한 큐레이션
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curation_id", nullable = false)
    private Curation curation;

    /**
     * 댓글 내용 (텍스트 형태, 필수값)
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * 댓글 생성 시간 (수정 불가)
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 댓글 수정 시간
     */
    private LocalDateTime modifiedAt;

    /**
     * 엔티티가 저장되기 전, 생성 시간을 자동 설정합니다.
     */
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    /**
     * 엔티티가 업데이트되기 전, 수정 시간을 자동 설정합니다.
     */
    @PreUpdate
    public void preUpdate() {
        this.modifiedAt = LocalDateTime.now();
    }
}

