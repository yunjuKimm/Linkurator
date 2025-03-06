package com.team8.project2.domain.link.controller;

import com.team8.project2.domain.link.dto.LinkReqDTO;
import com.team8.project2.domain.link.dto.LinkResDTO;
import com.team8.project2.domain.link.entity.Link;
import com.team8.project2.domain.link.service.LinkService;
import com.team8.project2.global.dto.RsData;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/link")
@RequiredArgsConstructor
public class ApiV1LinkController {

    private final LinkService linkService;

    // 링크 추가
    @PostMapping
    public RsData<Link> addLink(@RequestBody @Valid LinkReqDTO linkDTO) {
        Link link = linkService.addLink(linkDTO.getUrl());
        return new RsData<>("201-1", "링크가 성공적으로 추가되었습니다.", link);
    }

    // 링크 수정
    @PutMapping("/{linkId}")
    public RsData<Link> updateLink(@PathVariable Long linkId, @RequestBody @Valid LinkReqDTO linkDTO) {
        Link updatedLink = linkService.updateLink(linkId, linkDTO.getUrl());
        return new RsData<>("200-1", "링크가 성공적으로 수정되었습니다.", updatedLink);
    }

    // 링크 삭제
    @DeleteMapping("/{linkId}")
    public RsData<Void> deleteLink(@PathVariable Long linkId) {
        linkService.deleteLink(linkId);
        return new RsData<>("204-1", "링크가 성공적으로 삭제되었습니다.");
    }

    // 메타 데이터 추출 API
    @PostMapping("/preview")
    public RsData<LinkResDTO> getLinkPreview(@RequestBody @Valid LinkReqDTO linkDTO)  {
        System.out.println("linkDTO.getUrl() = " + linkDTO.getUrl());
        LinkResDTO linkResDTO = linkService.getLinkMetaData(linkDTO.getUrl());
        return new RsData<>("200","메타 데이터가 성공적으로 추출되었습니다.",linkResDTO);
    }
}
