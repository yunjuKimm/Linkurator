package com.team8.project2.domain.curation.service;

import com.team8.project2.domain.curation.entity.Curation;
import com.team8.project2.domain.curation.repository.CurationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CurationService {

    private final CurationRepository curationRepository;


    // 글 생성
    public Curation createCuration(Curation curation) {
        curation.setCreatedAt(LocalDateTime.now());
        return curationRepository.save(curation);
    }

    // 글 수정
    public Curation updateCuration(Long postId, Curation updatedCuration) {
        Optional<Curation> curationOptional = curationRepository.findById(postId);
        if (curationOptional.isPresent()) {
            Curation post = curationOptional.get();
            post.setTitle(updatedCuration.getTitle());
            post.setContent(updatedCuration.getContent());
            post.setModifiedAt(LocalDateTime.now());
            return curationRepository.save(post);
        }
        throw new RuntimeException("Post not found");
    }

    // 글 삭제
    public void deleteCuration(Long postId) {
        curationRepository.deleteById(postId);
    }

    // 글 조회
    public Optional<Curation> getPost(Long postId) {
        return curationRepository.findById(postId);
    }


}
