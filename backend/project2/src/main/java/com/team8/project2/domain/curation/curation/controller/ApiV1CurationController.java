package com.team8.project2.domain.curation.curation.controller;

import com.team8.project2.domain.curation.curation.dto.CurationReqDTO;
import com.team8.project2.domain.curation.curation.dto.CurationResDto;
import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.curation.curation.service.CurationService;
import com.team8.project2.domain.curation.tag.service.TagService;
import com.team8.project2.global.dto.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/curation")
public class ApiV1CurationController {

    private final CurationService curationService;
    private final TagService tagService;

    // 글 생성
    @PostMapping
    public RsData<CurationResDto> createCuration(@RequestBody CurationReqDTO curationReq) {
        Curation createdCuration = curationService.createCuration(curationReq.getTitle(), curationReq.getContent(), curationReq.getLinkReqDtos().stream().map(url -> url.getUrl()).collect(Collectors.toUnmodifiableList()), curationReq.getTagReqDtos().stream().map(tag -> tag.getName()).collect(Collectors.toUnmodifiableList()));
        return new RsData<>("201-1", "글이 성공적으로 생성되었습니다.", new CurationResDto(createdCuration));
    }

    // 글 수정
    @PutMapping("/{id}")
    public RsData<CurationResDto> updateCuration(@PathVariable Long id, @RequestBody CurationReqDTO curationReq) {
        Curation updatedCuration = curationService.updateCuration(id, curationReq.getTitle(), curationReq.getContent(), curationReq.getLinkReqDtos().stream().map(url -> url.getUrl()).collect(Collectors.toUnmodifiableList()), curationReq.getTagReqDtos().stream().map(tag -> tag.getName()).collect(Collectors.toUnmodifiableList()));
        return new RsData<>("200-1", "글이 성공적으로 수정되었습니다.", new CurationResDto(updatedCuration));
    }

    // 글 삭제
    @DeleteMapping("/{id}")
    public RsData<Void> deleteCuration(@PathVariable Long id) {
        curationService.deleteCuration(id);
        return new RsData<>("204-1", "글이 성공적으로 삭제되었습니다.", null);
    }

    // 글 조회
    @GetMapping("/{id}")
    public RsData<CurationResDto> getCuration(@PathVariable Long id) {
        Curation curation = curationService.getCuration(id);
        return new RsData<>("200-1", "조회 성공", new CurationResDto(curation));
    }

    // 태그로 글 검색
    @GetMapping("/search")
    public RsData<List<CurationResDto>> findCurationByTags(@RequestParam List<String> tags) {
        List<CurationResDto> result = tagService.findCurationByTags(tags).stream()
                .map(curation -> new CurationResDto(curation))
                .collect(Collectors.toUnmodifiableList());
        return new RsData<>("200-1", "글이 검색되었습니다.", result);
    }
}
