package com.team8.project2.domain.comment.dto;

import java.time.LocalDateTime;

import com.team8.project2.domain.comment.entity.ReplyComment;

import lombok.Getter;

@Getter
public class ReplyCommentDto {

	/** 댓글 ID */
	private Long id;

	/** 댓글 작성자의 사용자 ID */
	private String authorName;

	/** 답글 작성자의 프로필 이미지 */
	private String authorProfileImageUrl;

	/** 댓글 내용 */
	private String content;

	/** 댓글 생성 시간 */
	private LocalDateTime createdAt;

	/** 댓글 수정 시간 */
	private LocalDateTime modifiedAt;

	public static ReplyCommentDto fromEntity(ReplyComment savedReply) {
		ReplyCommentDto dto = new ReplyCommentDto();
		dto.id = savedReply.getId();
		dto.authorName = savedReply.getAuthorName();
		dto.authorProfileImageUrl = savedReply.getAuthorProfileImageUrl();
		dto.content = savedReply.getContent();
		dto.createdAt = savedReply.getCreatedAt();
		dto.modifiedAt = savedReply.getModifiedAt();
		return dto;
	}
}
