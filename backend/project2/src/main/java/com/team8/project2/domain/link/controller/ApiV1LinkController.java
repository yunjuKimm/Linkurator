package com.team8.project2.domain.link.controller;

import com.team8.project2.domain.link.dto.LinkReqDTO;
import com.team8.project2.domain.link.dto.LinkResDTO;
import com.team8.project2.domain.link.entity.Link;
import com.team8.project2.domain.link.service.LinkService;
import com.team8.project2.global.dto.RsData;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 링크(Link) 관련 API 컨트롤러 클래스입니다.
 * 링크 추가, 수정, 삭제 기능을 제공합니다.
 */
@RestController
@RequestMapping("/api/v1/link")
@RequiredArgsConstructor
public class ApiV1LinkController {

    private final LinkService linkService;

    /**
     * 새로운 링크를 추가합니다.
     * @param linkDTO 링크 추가 요청 데이터
     * @return 추가된 링크 정보 응답
     */
    @PostMapping
    public RsData<Link> addLink(@RequestBody @Valid LinkReqDTO linkDTO) {
        Link link = linkService.addLink(linkDTO.getUrl());
        return new RsData<>("201-1", "링크가 성공적으로 추가되었습니다.", link);
    }

    /**
     * 기존 링크를 수정합니다.
     * @param linkId 수정할 링크 ID
     * @param linkDTO 수정할 링크 요청 데이터
     * @return 수정된 링크 정보 응답
     */
    @PutMapping("/{linkId}")
    public RsData<Link> updateLink(@PathVariable Long linkId, @RequestBody @Valid LinkReqDTO linkDTO) {
        Link updatedLink = linkService.updateLink(linkId, linkDTO.getUrl());
        return new RsData<>("200-1", "링크가 성공적으로 수정되었습니다.", updatedLink);
    }

    /**
     * 특정 링크를 삭제합니다.
     * @param linkId 삭제할 링크 ID
     * @return 삭제 성공 응답
     */
    @DeleteMapping("/{linkId}")
    public RsData<Void> deleteLink(@PathVariable Long linkId) {
        linkService.deleteLink(linkId);
        return new RsData<>("204-1", "링크가 성공적으로 삭제되었습니다.");
    }

    /**
     * 링크 URL을 입력받아 해당 링크의 메타 데이터를 추출합니다.
     * @param linkDTO 링크 URL
     * @return 링크 메타 데이터 응답
     */
    @PostMapping("/preview")
    public RsData<LinkResDTO> getLinkPreview(@RequestBody @Valid LinkReqDTO linkDTO)  {
        System.out.println("linkDTO.getUrl() = " + linkDTO.getUrl());
        LinkResDTO linkResDTO = linkService.getLinkMetaData(linkDTO.getUrl());
        return new RsData<>("200","메타 데이터가 성공적으로 추출되었습니다.",linkResDTO);
    }

    /**
     * 특정 링크를 조회하고 조회수를 증가시킵니다. (IP 기준)
     * @param linkId 조회할 링크 ID
     * @param request 클라이언트 요청 객체 (IP 추출용)
     * @return 조회된 링크 정보 응답
     */
    @GetMapping("/{linkId}")
    public RsData<Link> getLink(@PathVariable Long linkId, HttpServletRequest request) {
        Link link = linkService.getLinkAndIncrementClick(linkId, request);
        return new RsData<>("200-2", "링크가 성공적으로 조회되었습니다.", link);
    }

}
