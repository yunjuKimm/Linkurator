package com.team8.project2.domain.link.controller;

import com.team8.project2.domain.link.dto.LinkDTO;
import com.team8.project2.domain.link.entity.Link;
import com.team8.project2.domain.link.service.LinkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/link")
@RequiredArgsConstructor
public class ApiV1LinkController {

    private final LinkService linkService;

    // 링크 추가
    @PostMapping
    public ResponseEntity<Link> addLink(@RequestBody @Valid LinkDTO linkDTO) {
        Link link = linkService.addLink(linkDTO.getUrl(), linkDTO.getTitle(), linkDTO.getDescription(), linkDTO.getThumbnail());
        return ResponseEntity.ok(link);
    }

    // 링크 수정
    @PutMapping("/{linkId}")
    public ResponseEntity<Link> updateLink(@PathVariable String linkId, @RequestBody @Valid LinkDTO linkDTO) {
        Link updatedLink = linkService.updateLink(linkId, linkDTO.getTitle(), linkDTO.getDescription(), linkDTO.getThumbnail());
        return ResponseEntity.ok(updatedLink);
    }

    // 링크 삭제
    @DeleteMapping("/{linkId}")
    public ResponseEntity<Void> deleteLink(@PathVariable String linkId) {
        linkService.deleteLink(linkId);
        return ResponseEntity.noContent().build();
    }
}
