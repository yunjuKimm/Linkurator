package com.team8.project2.domain.comment.dto;

import com.team8.project2.domain.comment.entity.Comment;
import com.team8.project2.domain.curation.entity.Curation;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDto {
    private Long id;
    private Long memberId;
    private Long curationId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;

    public static CommentDto fromEntity(Comment comment) {
        return CommentDto.builder()
                .id(comment.getId())
                .memberId(comment.getMemberId())
                .curationId(comment.getCuration().getId())  // Curation 엔티티에서 ID만 전달
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .modifiedAt(comment.getModifiedAt())
                .build();
    }

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
