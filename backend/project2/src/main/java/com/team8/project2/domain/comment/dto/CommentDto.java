package com.team8.project2.domain.comment.dto;

import com.team8.project2.domain.comment.entity.Comment;
import com.team8.project2.domain.curation.curation.entity.Curation;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 댓글(Comment) 데이터 전송 객체(DTO) 클래스입니다.
 * 엔티티와의 변환을 지원하며, 클라이언트와의 데이터 교환을 담당합니다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDto {

    /** 댓글 ID */
    private Long id;

    /** 댓글 작성자의 사용자 ID */
    private Long memberId;

    /** 댓글이 속한 큐레이션의 ID */
    private Long curationId;

    /** 댓글 내용 */
    private String content;

    /** 댓글 생성 시간 */
    private LocalDateTime createdAt;

    /** 댓글 수정 시간 */
    private LocalDateTime modifiedAt;

    /**
     * 엔티티(Comment) 객체를 DTO(CommentDto)로 변환합니다.
     * @param comment 변환할 댓글 엔티티
     * @return 변환된 댓글 DTO
     */
    public static CommentDto fromEntity(Comment comment) {
        return CommentDto.builder()
                .id(comment.getId())
                .memberId(comment.getMemberId())
                .curationId(comment.getCuration().getId()) // Curation 엔티티에서 ID만 전달
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .modifiedAt(comment.getModifiedAt())
                .build();
    }

    /**
     * DTO(CommentDto)를 엔티티(Comment)로 변환합니다.
     * @param curation 댓글이 속한 큐레이션 엔티티
     * @return 변환된 댓글 엔티티
     */
    public Comment toEntity(Curation curation) {
        return Comment.builder()
                .id(id)
                .memberId(memberId)
                .curation(curation)
                .content(content)
                .createdAt(createdAt)
                .modifiedAt(modifiedAt)
                .build();
    }
}

