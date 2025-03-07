package com.team8.project2.domain.comment.controller;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.team8.project2.domain.comment.dto.CommentDto;
import com.team8.project2.domain.comment.service.CommentService;

@Transactional
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class ApiV1CommentControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private CommentService commentService;

	@Test
	@DisplayName("댓글을 작성할 수 있다")
	void createComment() throws Exception {
		CommentDto commentDto = CommentDto.builder()
			.content("content example")
			.build();

		mockMvc.perform(post("/api/v1/curations/1/comments")
				.contentType("application/json")
				.content(new ObjectMapper().writeValueAsString(commentDto)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.code").value("200-OK"))
			.andExpect(jsonPath("$.msg").value("Success"))
			.andExpect(jsonPath("$.data.id").isNumber())
			.andExpect(jsonPath("$.data.authorName").value("username"))
			.andExpect(jsonPath("$.data.content").value("content example"));

		// BaseInitData에서 추가된 샘플 데이터를 포함해 2개
		assertThat(commentService.getCommentsByCurationId(1L)).hasSize(2);
	}

	@Test
	@DisplayName("댓글을 조회할 수 있다")
	void getCommentsByCurationId() throws Exception {
		createCommentAtCuration(1L);

		mockMvc.perform(get("/api/v1/curations/1/comments"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.code").value("200-OK"))
			.andExpect(jsonPath("$.msg").value("Success"))
			.andExpect(jsonPath("$.data[0].id").value("1"))
			.andExpect(jsonPath("$.data[0].authorName").value("username"))
			.andExpect(jsonPath("$.data[0].content").value("comment test content"));
	}

	private CommentDto createCommentAtCuration(Long curationId) {
		CommentDto commentDto = CommentDto.builder()
			.content("content example")
			.build();
		return commentService.createComment(curationId, commentDto);
	}

	@Test
	@DisplayName("댓글을 삭제할 수 있다.")
	void deleteComment() throws Exception {
		CommentDto savedCommentDto = createCommentAtCuration(1L);

		mockMvc.perform(delete("/api/v1/curations/1/comments/%d".formatted(savedCommentDto.getId())))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.code").value("200-1"))
			.andExpect(jsonPath("$.msg").value("댓글이 삭제되었습니다."));
	}
}