package com.team8.project2.domain.comment.controller;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.BeforeEach;
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
import com.team8.project2.domain.comment.repository.CommentRepository;
import com.team8.project2.domain.comment.service.CommentService;
import com.team8.project2.domain.member.entity.Member;
import com.team8.project2.domain.member.repository.MemberRepository;
import com.team8.project2.domain.member.service.AuthTokenService;

@Transactional
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class ApiV1CommentControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private CommentService commentService;

	@Autowired
	private MemberRepository memberRepository;

	@Autowired
	private AuthTokenService authTokenService;

	String authorAccessKey;
	@Autowired
	private CommentRepository commentRepository;

	@BeforeEach
	void setUp() {
		Member author = memberRepository.findById(1L).get();
		authorAccessKey = authTokenService.genAccessToken(author);
	}

	@Test
	@DisplayName("댓글을 작성할 수 있다")
	void createComment() throws Exception {
		CommentDto commentDto = CommentDto.builder()
			.content("content example")
			.build();

		mockMvc.perform(post("/api/v1/curations/1/comments")
				.header("Authorization", "Bearer " + authorAccessKey)
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
	@DisplayName("실패 - 인증 정보가 없으면 댓글 작성에 실패한다")
	void createCommentWithNoAuth() throws Exception {
		CommentDto commentDto = CommentDto.builder()
			.content("content example")
			.build();

		mockMvc.perform(post("/api/v1/curations/1/comments")
				.contentType("application/json")
				.content(new ObjectMapper().writeValueAsString(commentDto)))
			.andExpect(status().isUnauthorized());

		// 샘플 데이터를 제외하고 댓글이 추가되지 않음
		assertThat(commentRepository.count()).isEqualTo(1);
	}

	@Test
	@DisplayName("실패 - 인증 정보가 잘못되었으면 댓글 작성에 실패한다")
	void createCommentWithWrongAuth() throws Exception {
		String wrongAuth = "wrongAuth";

		CommentDto commentDto = CommentDto.builder()
			.content("content example")
			.build();

		mockMvc.perform(post("/api/v1/curations/1/comments")
				.header("Authorization", "Bearer " + wrongAuth)
				.contentType("application/json")
				.content(new ObjectMapper().writeValueAsString(commentDto)))
			.andExpect(status().isUnauthorized());

		// 샘플 데이터를 제외하고 댓글이 추가되지 않음
		assertThat(commentRepository.count()).isEqualTo(1);
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
		Member author = memberRepository.findById(1L).get();
		CommentDto commentDto = CommentDto.builder()
			.content("content example")
			.build();
		return commentService.createComment(author, curationId, commentDto);
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