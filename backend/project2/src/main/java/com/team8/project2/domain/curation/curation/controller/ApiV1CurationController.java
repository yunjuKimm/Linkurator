package com.team8.project2.domain.curation.curation.controller;

import com.team8.project2.domain.curation.curation.dto.CurationReqDTO;
import com.team8.project2.domain.curation.curation.dto.CurationResDto;
import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.curation.curation.entity.SearchOrder;
import com.team8.project2.domain.curation.curation.service.CurationService;
import com.team8.project2.domain.curation.tag.service.TagService;
import com.team8.project2.global.dto.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 큐레이션(Curation) API 컨트롤러 클래스입니다.
 * 큐레이션 생성, 수정, 삭제, 조회 및 검색 기능을 제공합니다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/curation")
public class ApiV1CurationController {

    private final CurationService curationService;
    private final TagService tagService;

    /**
     * 새로운 큐레이션을 생성합니다.
     * @param curationReq 큐레이션 생성 요청 데이터
     * @return 생성된 큐레이션 정보 응답
     */
    @PostMapping
    public RsData<CurationResDto> createCuration(@RequestBody CurationReqDTO curationReq) {
        Curation createdCuration = curationService.createCuration(
                curationReq.getTitle(),
                curationReq.getContent(),
                curationReq.getLinkReqDtos().stream().map(url -> url.getUrl()).collect(Collectors.toUnmodifiableList()),
                curationReq.getTagReqDtos().stream().map(tag -> tag.getName()).collect(Collectors.toUnmodifiableList())
        );
        return new RsData<>("201-1", "글이 성공적으로 생성되었습니다.", new CurationResDto(createdCuration));
    }

    /**
     * 기존 큐레이션을 수정합니다.
     * @param id 큐레이션 ID
     * @param curationReq 큐레이션 수정 요청 데이터
     * @return 수정된 큐레이션 정보 응답
     */
    @PutMapping("/{id}")
    public RsData<CurationResDto> updateCuration(@PathVariable Long id, @RequestBody CurationReqDTO curationReq) {
        Curation updatedCuration = curationService.updateCuration(
                id,
                curationReq.getTitle(),
                curationReq.getContent(),
                curationReq.getLinkReqDtos().stream().map(url -> url.getUrl()).collect(Collectors.toUnmodifiableList()),
                curationReq.getTagReqDtos().stream().map(tag -> tag.getName()).collect(Collectors.toUnmodifiableList())
        );
        return new RsData<>("200-1", "글이 성공적으로 수정되었습니다.", new CurationResDto(updatedCuration));
    }

    /**
     * 특정 큐레이션을 삭제합니다.
     * @param id 큐레이션 ID
     * @return 삭제 성공 응답
     */
    @DeleteMapping("/{id}")
    public RsData<Void> deleteCuration(@PathVariable Long id) {
        curationService.deleteCuration(id);
        return new RsData<>("204-1", "글이 성공적으로 삭제되었습니다.", null);
    }

    /**
     * 특정 큐레이션을 조회합니다.
     * @param id 큐레이션 ID
     * @return 조회된 큐레이션 정보 응답
     */
    @GetMapping("/{id}")
    public RsData<CurationResDto> getCuration(@PathVariable Long id) {
        Curation curation = curationService.getCuration(id);
        return new RsData<>("200-1", "조회 성공", new CurationResDto(curation));
    }

    /**
     * 큐레이션을 검색하거나 전체 조회합니다.
     * @param tags 태그 목록 (선택적)
     * @param title 제목 검색어 (선택적)
     * @param content 내용 검색어 (선택적)
     * @param order 정렬 기준 (기본값: 최신순)
     * @return 검색된 큐레이션 목록 응답
     */
    @GetMapping
    @Transactional(readOnly = true)
    public RsData<List<CurationResDto>> searchCuration(
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String content,
            @RequestParam(required = false, defaultValue = "LATEST") SearchOrder order
    ) {
        List<CurationResDto> result = curationService.searchCurations(tags, title, content, order)
                .stream()
                .map(CurationResDto::new)
                .collect(Collectors.toUnmodifiableList());

        return new RsData<>("200-1", "글이 검색되었습니다.", result);
    }

    /**
     * 특정 큐레이션에 좋아요를 추가합니다.
     * @param id 큐레이션 ID
     * @param memberId 좋아요를 누른 회원 ID
     * @return 좋아요 성공 응답
     */
    @PostMapping("/{id}")
    public RsData<Void> likeCuration(@PathVariable Long id, @RequestParam Long memberId) {
        curationService.likeCuration(id, memberId);
        return new RsData<>("200-1", "글에 좋아요를 했습니다.", null);
    }
}
