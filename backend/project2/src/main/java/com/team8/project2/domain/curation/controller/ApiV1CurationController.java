package com.team8.project2.domain.curation.controller;

import com.team8.project2.domain.curation.dto.CurationReqDTO;
import com.team8.project2.domain.curation.dto.CurationResDto;
import com.team8.project2.domain.curation.entity.Curation;
import com.team8.project2.domain.curation.service.CurationService;
import com.team8.project2.global.dto.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/curation")
public class ApiV1CurationController {

    private final CurationService curationService;

    // 글 생성
    @PostMapping
    public RsData<CurationResDto> createCuration(@RequestBody CurationReqDTO curationReq) {
        Curation createdCuration = curationService.createCuration(
                curationReq.getTitle(),
                curationReq.getContent(),
                curationReq.getLinkReqDtos().stream()
                        .map(url -> url.getUrl())
                        .collect(Collectors.toUnmodifiableList()));
        return new RsData<>("201-1", "글이 성공적으로 생성되었습니다.", new CurationResDto(createdCuration));
    }

    // 글 수정
    @PutMapping("/{id}")
    public RsData<Curation> updateCuration(@PathVariable Long id, @RequestBody CurationReqDTO curationReq) {
        Curation updatedCuration = curationService.updateCuration(
                id,
                curationReq.getTitle(),
                curationReq.getContent(),
                curationReq.getLinkReqDtos().stream()
                        .map(url -> url.getUrl())
                        .collect(Collectors.toUnmodifiableList())
                );
        return new RsData<>("200-1", "글이 성공적으로 수정되었습니다.", updatedCuration);
    }

    // 글 삭제
    @DeleteMapping("/{id}")
    public RsData<Void> deleteCuration(@PathVariable Long id) {
        curationService.deleteCuration(id);
        return new RsData<>("204-1", "글이 성공적으로 삭제되었습니다.", null);
    }

    // 글 조회
    @GetMapping("/{id}")
    public RsData<Curation> getCuration(@PathVariable Long id) {
        Curation curation = curationService.getCuration(id);
        return new RsData<>("200-1", "조회 성공", curation);
    }
}
