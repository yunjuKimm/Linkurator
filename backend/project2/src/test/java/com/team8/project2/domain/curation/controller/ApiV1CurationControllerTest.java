package com.team8.project2.domain.curation.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.team8.project2.domain.curation.curation.dto.CurationReqDTO;
import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.curation.curation.repository.CurationRepository;
import com.team8.project2.domain.curation.curation.service.CurationService;
import com.team8.project2.domain.curation.tag.dto.TagReqDto;
import com.team8.project2.domain.link.dto.LinkReqDTO;
import com.team8.project2.domain.member.entity.Member;
import com.team8.project2.domain.member.entity.RoleEnum;
import com.team8.project2.domain.member.repository.MemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Transactional
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
public class ApiV1CurationControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private CurationService curationService; // 실제 서비스 사용

	private CurationReqDTO curationReqDTO;
	@Autowired
	private CurationRepository curationRepository;
	@Autowired
	private MemberRepository memberRepository;

	@BeforeEach
	void setUp() {
		// CurationReqDTO 설정 (링크 포함)
		curationReqDTO = new CurationReqDTO();
		curationReqDTO.setTitle("Test Title");
		curationReqDTO.setContent("Test Content");

		// LinkReqDTO 생성
		LinkReqDTO linkReqDTO = new LinkReqDTO();
		linkReqDTO.setUrl("https://example.com");

		// TagReqDTO
		TagReqDto tagReqDto = new TagReqDto();
		tagReqDto.setName("test");

		// 링크 리스트에 추가
		curationReqDTO.setLinkReqDtos(Collections.singletonList(linkReqDTO));
		// 태그 리스트에 추가
		curationReqDTO.setTagReqDtos(Collections.singletonList(tagReqDto));
	}

	// 글 생성 테스트
	@Test
	void createCuration() throws Exception {
		mockMvc.perform(post("/api/v1/curation").contentType("application/json")
				.content(new ObjectMapper().writeValueAsString(curationReqDTO)))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.code").value("201-1"))
			.andExpect(jsonPath("$.msg").value("글이 성공적으로 생성되었습니다."))
			.andExpect(jsonPath("$.data.title").value("Test Title"))
			.andExpect(jsonPath("$.data.content").value("Test Content"))
			.andExpect(jsonPath("$.data.urls[0].url").value("https://example.com"))
			.andExpect(jsonPath("$.data.tags[0].name").value("test"));
	}

	// 글 수정 테스트
//	@Test
//	void updateCuration() throws Exception {
//		// 테스트용 데이터 저장
//		Curation savedCuration = curationService.createCuration("before title", "before content",
//			List.of("https://www.google.com", "https://www.naver.com"), List.of("변경전 태그", "예시 태그"));
//
//
//
//		mockMvc.perform(put("/api/v1/curation/{id}", savedCuration.getId()).contentType("application/json")
//				.content(new ObjectMapper().writeValueAsString(curationReqDTO)))
//			.andExpect(status().isOk())
//			.andExpect(jsonPath("$.code").value("200-1"))
//			.andExpect(jsonPath("$.msg").value("글이 성공적으로 수정되었습니다."))
//			.andExpect(jsonPath("$.data.title").value("Test Title"))
//			.andExpect(jsonPath("$.data.content").value("Test Content"))
//			.andExpect(jsonPath("$.data.urls.length()").value(1))
//			.andExpect(jsonPath("$.data.urls[0].url").value("https://example.com"))
//			.andExpect(jsonPath("$.data.tags.length()").value(1))
//			.andExpect(jsonPath("$.data.tags[0].name").value("test"));
//	}

	// 글 삭제 테스트
	@Test
	void deleteCuration() throws Exception {
		mockMvc.perform(delete("/api/v1/curation/{id}", 1L)).andExpect(status().isNoContent());
	}

	// 글 조회 테스트
	@Test
	void getCuration() throws Exception {
		mockMvc.perform(get("/api/v1/curation/{id}", 1L))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.code").value("200-1"))
				.andExpect(jsonPath("$.msg").value("조회 성공"))
				.andExpect(jsonPath("$.data.title").value("curation test title"))
				.andExpect(jsonPath("$.data.urls[0].url").value("https://www.naver.com/"))
				.andExpect(jsonPath("$.data.urls[1].url").value("https://www.github.com/"))
				.andExpect(jsonPath("$.data.tags[0].name").value("포털"))
				.andExpect(jsonPath("$.data.tags[1].name").value("개발"))
				.andExpect(jsonPath("$.data.comments[0].content").value("comment test content"));
	}

	// 글 전체 조회
	@Test
	void findAll() throws Exception {
		for (int i = 0; i < 10; i++) {

			curationService.createCuration(curationReqDTO.getTitle(), curationReqDTO.getContent(),
				curationReqDTO.getLinkReqDtos()
					.stream()
					.map(linkReqDto -> linkReqDto.getUrl())
					.collect(Collectors.toUnmodifiableList()), curationReqDTO.getTagReqDtos()
					.stream()
					.map(tagReqDto -> tagReqDto.getName())
					.collect(Collectors.toUnmodifiableList()));
		}

		mockMvc.perform(get("/api/v1/curation"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.code").value("200-1"))
				.andExpect(jsonPath("$.msg").value("글이 검색되었습니다."))
				.andExpect(jsonPath("$.data.length()").value(11));
	}

	// 태그로 글 검색
	@Test
	void findCurationByTags() throws Exception {
		createCurationWithTags(List.of("ex1", "ex2", "ex3"));
		createCurationWithTags(List.of("ex2", "ex3", "ex4", "ex5"));
		createCurationWithTags(List.of("ex2", "ex1", "ex3"));
		mockMvc.perform(get("/api/v1/curation").param("tags", "ex1"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.code").value("200-1"))
			.andExpect(jsonPath("$.msg").value("글이 검색되었습니다."))
			.andExpect(jsonPath("$.data.length()").value(2));
	}

	private Curation createCurationWithTags(List<String> tags) {
		return curationService.createCuration(curationReqDTO.getTitle(), curationReqDTO.getContent(),
			curationReqDTO.getLinkReqDtos()
				.stream()
				.map(linkReqDto -> linkReqDto.getUrl())
				.collect(Collectors.toUnmodifiableList()), tags);
	}

	// 제목으로 글 검색
	@Test
	void findCurationByTitle() throws Exception {
		createCurationWithTitle("ex1");
		createCurationWithTitle("test-ex");
		createCurationWithTitle("test");


		mockMvc.perform(get("/api/v1/curation").param("title", "ex"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.code").value("200-1"))
			.andExpect(jsonPath("$.msg").value("글이 검색되었습니다."))
			.andExpect(jsonPath("$.data.length()").value(2));
	}

	private Curation createCurationWithTitle(String title) {
		return curationService.createCuration(title, curationReqDTO.getContent(), curationReqDTO.getLinkReqDtos()
			.stream()
			.map(linkReqDto -> linkReqDto.getUrl())
			.collect(Collectors.toUnmodifiableList()), curationReqDTO.getTagReqDtos()
			.stream()
			.map(tagReqDto -> tagReqDto.getName())
			.collect(Collectors.toUnmodifiableList()));
	}

	// 내용으로 글 검색
	@Test
	void findCurationByContent() throws Exception {
		createCurationWithContent("example");
		createCurationWithContent("test-example");
		createCurationWithContent("test");

		mockMvc.perform(get("/api/v1/curation").param("content", "example"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.code").value("200-1"))
			.andExpect(jsonPath("$.msg").value("글이 검색되었습니다."))
			.andExpect(jsonPath("$.data.length()").value(2));
	}

	private Curation createCurationWithContent(String content) {
		return curationService.createCuration(curationReqDTO.getTitle(), content, curationReqDTO.getLinkReqDtos()
			.stream()
			.map(linkReqDto -> linkReqDto.getUrl())
			.collect(Collectors.toUnmodifiableList()), curationReqDTO.getTagReqDtos()
			.stream()
			.map(tagReqDto -> tagReqDto.getName())
			.collect(Collectors.toUnmodifiableList()));
	}

	// 제목과 내용으로 글 검색
	@Test
	void findCurationByTitleAndContent() throws Exception {
		createCurationWithTitleAndContent("popular", "famous1");
		createCurationWithTitleAndContent("sample", "test-famous");
		createCurationWithTitleAndContent("test", "test");

		mockMvc.perform(get("/api/v1/curation").param("title", "popular").param("content", "famous"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.code").value("200-1"))
			.andExpect(jsonPath("$.msg").value("글이 검색되었습니다."))
			.andExpect(jsonPath("$.data.length()").value(1));
	}

	private Curation createCurationWithTitleAndContent(String title, String content) {
		return curationService.createCuration(title, content, curationReqDTO.getLinkReqDtos()
			.stream()
			.map(linkReqDto -> linkReqDto.getUrl())
			.collect(Collectors.toUnmodifiableList()), curationReqDTO.getTagReqDtos()
			.stream()
			.map(tagReqDto -> tagReqDto.getName())
			.collect(Collectors.toUnmodifiableList()));
	}

	// 최신순으로 글 조회
	@Test
	void findCurationByLatest() throws Exception {
		createCurationWithTitleAndContent("title1", "content1");
		createCurationWithTitleAndContent("title2", "content2");
		createCurationWithTitleAndContent("title3", "content3");

		mockMvc.perform(get("/api/v1/curation").param("order", "LATEST"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.code").value("200-1"))
			.andExpect(jsonPath("$.msg").value("글이 검색되었습니다."))
			.andExpect(jsonPath("$.data[0].content").value("content3"))
			.andExpect(jsonPath("$.data[1].content").value("content2"))
			.andExpect(jsonPath("$.data[2].content").value("content1"));
	}

	// 오래된순으로 글 조회
	@Test
	void findCurationByOldest() throws Exception {
		createCurationWithTitleAndContent("title1", "content1");
		createCurationWithTitleAndContent("title2", "content2");
		createCurationWithTitleAndContent("title3", "content3");

		mockMvc.perform(get("/api/v1/curation").param("order", "OLDEST"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.code").value("200-1"))
			.andExpect(jsonPath("$.msg").value("글이 검색되었습니다."))
			.andExpect(jsonPath("$.data[1].content").value("content1"))
			.andExpect(jsonPath("$.data[2].content").value("content2"))
			.andExpect(jsonPath("$.data[3].content").value("content3"));
	}

	// 좋아요순으로 글 조회
	@Test
	void findCurationByLikeCount() throws Exception {
		createCurationWithTitleAndContentAndLikeCount("title1", "content1", 4L);
		createCurationWithTitleAndContentAndLikeCount("title2", "content2", 10L);
		createCurationWithTitleAndContentAndLikeCount("title3", "content3", 2L);

		mockMvc.perform(get("/api/v1/curation").param("order", "LIKECOUNT"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.code").value("200-1"))
			.andExpect(jsonPath("$.msg").value("글이 검색되었습니다."))
			.andExpect(jsonPath("$.data[0].content").value("content2"))
			.andExpect(jsonPath("$.data[1].content").value("content1"))
			.andExpect(jsonPath("$.data[2].content").value("content3"));
	}

	private Curation createCurationWithTitleAndContentAndLikeCount(String title, String content, Long likeCount) {
		Curation curation = curationService.createCuration(title, content, curationReqDTO.getLinkReqDtos()
				.stream()
				.map(linkReqDto -> linkReqDto.getUrl())
				.collect(Collectors.toList()),
			curationReqDTO.getTagReqDtos().stream().map(tagReqDto -> tagReqDto.getName()).collect(Collectors.toList()));

		curation.setLikeCount(likeCount);
		curationRepository.save(curation);
		return curation;
	}

	// 좋아요 테스트
	@Test
	void likeCuration() throws Exception {
		// 테스트용 데이터 저장

		Curation savedCuration = curationService.createCuration("Test Title", "Test Content",
			curationReqDTO.getLinkReqDtos()
				.stream()
				.map(linkReqDto -> linkReqDto.getUrl())
				.collect(Collectors.toUnmodifiableList()), curationReqDTO.getTagReqDtos()
				.stream()
				.map(tagReqDto -> tagReqDto.getName())
				.collect(Collectors.toUnmodifiableList()));

		Long memberId = 1L; // 테스트용 회원 ID

		mockMvc.perform(
				post("/api/v1/curation/{id}", savedCuration.getId()).param("memberId", String.valueOf(memberId)))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.code").value("200-1"))
			.andExpect(jsonPath("$.msg").value("글에 좋아요를 했습니다."))
			.andExpect(jsonPath("$.data").doesNotExist()); // 응답 데이터가 없음을 확인
	}

	@Test
	void findCurationByAuthor() throws Exception {
		var author1 = createMember("author1");
		var author2 = createMember("author2");

		createCurationWithTitleAndMember("title1", author1);
		createCurationWithTitleAndMember("title2", author2);
		createCurationWithTitleAndMember("title3", author1);

		mockMvc.perform(get("/api/v1/curation").param("author", "author1"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.code").value("200-1"))
			.andExpect(jsonPath("$.msg").value("글이 검색되었습니다."))
			.andExpect(jsonPath("$.data.length()").value(2));
	}

	private Member createMember(String author) {
		Member member = Member.builder()
			.email(author + "@gmail.com")
			.role(RoleEnum.MEMBER)
			// .apiKey(author)
			.memberId(author)
			.username(author)
			.password("password")
			.profileImage("http://localhost:8080/images/team8-logo.png")
			.build();

		return memberRepository.save(member);
	}

	private void createCurationWithTitleAndMember(String title, Member author) {
		Curation curation = curationService.createCuration(title, "example content", List.of("https://www.google.com/"),
			List.of("tag1", "tag2"));
		curation.setMember(author);
		curationRepository.save(curation);
	}
}
