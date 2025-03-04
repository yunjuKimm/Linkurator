package com.team8.project2.domain.curation.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.team8.project2.domain.curation.curation.dto.CurationReqDTO;
import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.curation.curation.repository.CurationRepository;
import com.team8.project2.domain.curation.curation.service.CurationService;
import com.team8.project2.domain.curation.tag.dto.TagReqDto;
import com.team8.project2.domain.link.dto.LinkReqDTO;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
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
        tagReqDto.setName("tag1");

        // 링크 리스트에 추가
        curationReqDTO.setLinkReqDtos(Collections.singletonList(linkReqDTO));
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
                .andExpect(jsonPath("$.msg").value("글이 성공적으로 생성되었습니다."));

        curationRepository.flush();

        var curation = curationService.getCuration(1L);
        Assertions.assertThat(curation.getTags().getFirst().getTag().getName()).equals("tag1");
    }

    // 글 수정 테스트
    @Test
    void updateCuration() throws Exception {
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

        mockMvc.perform(put("/api/v1/curation/{id}", savedCuration.getId())
                        .contentType("application/json")
                        .content(new ObjectMapper().writeValueAsString(curationReqDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("200-1"))
                .andExpect(jsonPath("$.msg").value("글이 성공적으로 수정되었습니다."));
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
                .andExpect(jsonPath("$.data.id").value(savedCuration.getId()))
                .andExpect(jsonPath("$.data.title").value("Test Title"));
    }

    @Autowired
    private CurationRepository curationRepository;
}
