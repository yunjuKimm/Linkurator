package com.team8.project2.domain.comment.dto;

import com.team8.project2.domain.comment.entity.Comment;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDto {
    private Long commentId;
    private Long memberId;
    private Long curationId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;

    public static CommentDto fromEntity(Comment comment) {
        return CommentDto.builder()
                .commentId(comment.getCommentId())
                .memberId(comment.getMemberId())
                .curationId(comment.getCurationId())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .modifiedAt(comment.getModifiedAt())
                .build();
    }
}
