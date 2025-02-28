package com.team8.project2.domain.curation.controller;

import com.team8.project2.domain.curation.entity.Curation;
import com.team8.project2.domain.curation.service.CurationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/curation")
public class CurationController {

    private final CurationService curationService;



    // 글 생성
    @PostMapping
    public ResponseEntity<Curation> createPost(@RequestBody Curation curation) {
        Curation createdPost = curationService.createCuration(curation);
        return ResponseEntity.ok(createdPost);
    }

    // 글 수정
    @PutMapping("/{id}")
    public ResponseEntity<Curation> updatePost(@PathVariable Long id, @RequestBody Curation curation) {
        Curation updatedPost = curationService.updateCuration(id, curation);
        return ResponseEntity.ok(updatedPost);
    }

    // 글 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        curationService.deleteCuration(id);
        return ResponseEntity.noContent().build();
    }

    // 글 조회
    @GetMapping("/{id}")
    public ResponseEntity<Curation> getPost(@PathVariable Long id) {
        Optional<Curation> curation = curationService.getPost(id);
        return curation.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
