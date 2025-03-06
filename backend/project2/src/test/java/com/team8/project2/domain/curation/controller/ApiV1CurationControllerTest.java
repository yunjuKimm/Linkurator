package com.team8.project2.domain.curation.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.team8.project2.domain.curation.curation.dto.CurationReqDTO;
import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.curation.curation.repository.CurationRepository;
import com.team8.project2.domain.curation.curation.service.CurationService;
import com.team8.project2.domain.curation.tag.dto.TagReqDto;
import com.team8.project2.domain.link.dto.LinkReqDTO;
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

    @Autowired
    private CurationRepository curationRepository;

    private CurationReqDTO curationReqDTO;

    @BeforeEach
    void setUp() {
        curationRepository.deleteAll();

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
        mockMvc.perform(post("/api/v1/curation")
                        .contentType("application/json")
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
    @Test
    void updateCuration() throws Exception {
        // 테스트용 데이터 저장
        Curation savedCuration = curationService.createCuration(
                "before title",
                "before content",
                List.of("https://www.google.com", "https://www.naver.com"),
                List.of("변경전 태그", "예시 태그")
        );

        mockMvc.perform(put("/api/v1/curation/{id}", savedCuration.getId())
                        .contentType("application/json")
                        .content(new ObjectMapper().writeValueAsString(curationReqDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200-1"))
                .andExpect(jsonPath("$.msg").value("글이 성공적으로 수정되었습니다."))
                .andExpect(jsonPath("$.data.title").value("Test Title"))
                .andExpect(jsonPath("$.data.content").value("Test Content"))
                .andExpect(jsonPath("$.data.urls.length()").value(1))
                .andExpect(jsonPath("$.data.urls[0].url").value("https://example.com"))
                .andExpect(jsonPath("$.data.tags.length()").value(1))
                .andExpect(jsonPath("$.data.tags[0].name").value("test"));
    }

    // 글 삭제 테스트
    @Test
    void deleteCuration() throws Exception {
        // 테스트용 데이터 저장
        Curation savedCuration = curationService.createCuration(
                curationReqDTO.getTitle(),
                curationReqDTO.getContent(),
                curationReqDTO.getLinkReqDtos().stream()
                        .map(linkReqDTO -> linkReqDTO.getUrl())
                        .collect(Collectors.toUnmodifiableList()),
                curationReqDTO.getTagReqDtos().stream()
                        .map(tagReqDto -> tagReqDto.getName())
                        .collect(Collectors.toUnmodifiableList())
        );

        mockMvc.perform(delete("/api/v1/curation/{id}", savedCuration.getId()))
                .andExpect(status().isNoContent());
    }

    // 글 조회 테스트
    @Test
    void getCuration() throws Exception {
        // 테스트용 데이터 저장
        Curation savedCuration = curationService.createCuration(
                curationReqDTO.getTitle(),
                curationReqDTO.getContent(),
                curationReqDTO.getLinkReqDtos().stream()
                        .map(linkReqDto -> linkReqDto.getUrl())
                        .collect(Collectors.toUnmodifiableList()),
                curationReqDTO.getTagReqDtos().stream()
                        .map(tagReqDto -> tagReqDto.getName())
                        .collect(Collectors.toUnmodifiableList())
        );

        mockMvc.perform(get("/api/v1/curation/{id}", savedCuration.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200-1"))
                .andExpect(jsonPath("$.msg").value("조회 성공"))
                .andExpect(jsonPath("$.data.title").value("Test Title"));
    }

    // 글 전체 조회
    @Test
    void findAll() throws Exception {
        for (int i = 0; i < 10; i++) {
            curationService.createCuration(
                    curationReqDTO.getTitle(),
                    curationReqDTO.getContent(),
                    curationReqDTO.getLinkReqDtos().stream()
                            .map(linkReqDto -> linkReqDto.getUrl())
                            .collect(Collectors.toUnmodifiableList()),
                    curationReqDTO.getTagReqDtos().stream()
                            .map(tagReqDto -> tagReqDto.getName())
                            .collect(Collectors.toUnmodifiableList())
            );
        }

        mockMvc.perform(get("/api/v1/curation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200-1"))
                .andExpect(jsonPath("$.msg").value("글이 검색되었습니다."))
                .andExpect(jsonPath("$.data.length()").value(10));
    }


    // 태그로 글 검색
    @Test
    void findCurationByTags() throws Exception {
        Curation savedCuration1 = createCurationWithTags(List.of("tag1", "tag2", "tag3"));
        Curation savedCuration2 = createCurationWithTags(List.of("tag2", "tag3", "tag4", "tag5"));
        Curation savedCuration3 = createCurationWithTags(List.of("tag2", "tag1", "tag3"));

        mockMvc.perform(get("/api/v1/curation")
                        .param("tags", "tag1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200-1"))
                .andExpect(jsonPath("$.msg").value("글이 검색되었습니다."))
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    private Curation createCurationWithTags(List<String> tags) {
        return curationService.createCuration(
                curationReqDTO.getTitle(),
                curationReqDTO.getContent(),
                curationReqDTO.getLinkReqDtos().stream()
                        .map(linkReqDto -> linkReqDto.getUrl())
                        .collect(Collectors.toUnmodifiableList()),
                tags
        );
    }

    // 제목으로 글 검색
    @Test
    void findCurationByTitle() throws Exception {
        Curation savedCuration1 = createCurationWithTitle("title1");
        Curation savedCuration2 = createCurationWithTitle("test-title");
        Curation savedCuration3 = createCurationWithTitle("test");

        mockMvc.perform(get("/api/v1/curation")
                        .param("title", "title"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200-1"))
                .andExpect(jsonPath("$.msg").value("글이 검색되었습니다."))
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    private Curation createCurationWithTitle(String title) {
        return curationService.createCuration(
                title,
                curationReqDTO.getContent(),
                curationReqDTO.getLinkReqDtos().stream()
                        .map(linkReqDto -> linkReqDto.getUrl())
                        .collect(Collectors.toUnmodifiableList()),
                curationReqDTO.getTagReqDtos().stream()
                        .map(tagReqDto -> tagReqDto.getName())
                        .collect(Collectors.toUnmodifiableList())
        );
    }

    // 내용으로 글 검색
    @Test
    void findCurationByContent() throws Exception {
        Curation savedCuration1 = createCurationWithContent("content1");
        Curation savedCuration2 = createCurationWithContent("test-content");
        Curation savedCuration3 = createCurationWithContent("test");

        mockMvc.perform(get("/api/v1/curation")
                        .param("content", "content"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200-1"))
                .andExpect(jsonPath("$.msg").value("글이 검색되었습니다."))
                .andExpect(jsonPath("$.data.length()").value(2));
    }

    private Curation createCurationWithContent(String content) {
        return curationService.createCuration(
                curationReqDTO.getTitle(),
                content,
                curationReqDTO.getLinkReqDtos().stream()
                        .map(linkReqDto -> linkReqDto.getUrl())
                        .collect(Collectors.toUnmodifiableList()),
                curationReqDTO.getTagReqDtos().stream()
                        .map(tagReqDto -> tagReqDto.getName())
                        .collect(Collectors.toUnmodifiableList())
        );
    }

    // 제목과 내용으로 글 검색
    @Test
    void findCurationByTitleAndContent() throws Exception {
        Curation savedCuration1 = createCurationWithTitleAndContent("title", "content1");
        Curation savedCuration2 = createCurationWithTitleAndContent("sample", "test-content");
        Curation savedCuration3 = createCurationWithTitleAndContent("test", "test");

        mockMvc.perform(get("/api/v1/curation")
                        .param("title", "title")
                        .param("content", "content"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200-1"))
                .andExpect(jsonPath("$.msg").value("글이 검색되었습니다."))
                .andExpect(jsonPath("$.data.length()").value(1));
    }

    private Curation createCurationWithTitleAndContent(String title, String content) {
        return curationService.createCuration(
                title,
                content,
                curationReqDTO.getLinkReqDtos().stream()
                        .map(linkReqDto -> linkReqDto.getUrl())
                        .collect(Collectors.toUnmodifiableList()),
                curationReqDTO.getTagReqDtos().stream()
                        .map(tagReqDto -> tagReqDto.getName())
                        .collect(Collectors.toUnmodifiableList())
        );
    }

    // 최신순으로 글 조회
    @Test
    void findCurationByLatest() throws Exception {
        Curation savedCuration1 = createCurationWithTitleAndContent("title1", "content1");
        Curation savedCuration2 = createCurationWithTitleAndContent("title2", "content2");
        Curation savedCuration3 = createCurationWithTitleAndContent("title3", "content3");

        mockMvc.perform(get("/api/v1/curation")
                        .param("order", "LATEST"))
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
        Curation savedCuration1 = createCurationWithTitleAndContent("title1", "content1");
        Curation savedCuration2 = createCurationWithTitleAndContent("title2", "content2");
        Curation savedCuration3 = createCurationWithTitleAndContent("title3", "content3");

        mockMvc.perform(get("/api/v1/curation")
                        .param("order", "OLDEST"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200-1"))
                .andExpect(jsonPath("$.msg").value("글이 검색되었습니다."))
                .andExpect(jsonPath("$.data[0].content").value("content1"))
                .andExpect(jsonPath("$.data[1].content").value("content2"))
                .andExpect(jsonPath("$.data[2].content").value("content3"));
    }

    // 좋아요순으로 글 조회
    @Test
    void findCurationByLikeCount() throws Exception {
        Curation savedCuration1 = createCurationWithTitleAndContentAndLikeCount("title1", "content1", 4L);
        Curation savedCuration2 = createCurationWithTitleAndContentAndLikeCount("title2", "content2", 10L);
        Curation savedCuration3 = createCurationWithTitleAndContentAndLikeCount("title3", "content3", 2L);

        mockMvc.perform(get("/api/v1/curation")
                        .param("order", "LIKECOUNT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200-1"))
                .andExpect(jsonPath("$.msg").value("글이 검색되었습니다."))
                .andExpect(jsonPath("$.data[0].content").value("content2"))
                .andExpect(jsonPath("$.data[1].content").value("content1"))
                .andExpect(jsonPath("$.data[2].content").value("content3"));
    }

    private Curation createCurationWithTitleAndContentAndLikeCount(String title, String content, Long likeCount) {
        Curation curation = curationService.createCuration(
                title,
                content,
                curationReqDTO.getLinkReqDtos().stream()
                        .map(linkReqDto -> linkReqDto.getUrl())
                        .collect(Collectors.toList()),
                curationReqDTO.getTagReqDtos().stream()
                        .map(tagReqDto -> tagReqDto.getName())
                        .collect(Collectors.toList())
        );

        for (long l = 0; l < likeCount; l++) {
            curationService.likeCuration(curation.getId());
        }
        return curation;
    }
}
