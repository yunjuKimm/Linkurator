package com.team8.project2.domain.curation.service;

import com.team8.project2.domain.curation.entity.Curation;
import com.team8.project2.domain.curation.repository.CurationRepository;
import com.team8.project2.global.dto.RsData;
import com.team8.project2.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
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
    public Curation updateCuration(Long curationId, Curation updatedCuration) {
        Curation curation = curationRepository.findById(curationId)
                .orElseThrow(() -> new ServiceException("404-1", "해당 글을 찾을 수 없습니다."));

        curation.setTitle(updatedCuration.getTitle());
        curation.setContent(updatedCuration.getContent());
        curation.setModifiedAt(LocalDateTime.now());
        return curationRepository.save(curation);
    }

    // 글 삭제
    public void deleteCuration(Long curationId) {
        if (!curationRepository.existsById(curationId)) {
            throw new ServiceException("404-1", "해당 글을 찾을 수 없습니다.");
        }
        curationRepository.deleteById(curationId);
    }

    // 글 조회
    public Curation getCuration(Long curationId) {
        return curationRepository.findById(curationId)
                .orElseThrow(() -> new ServiceException("404-1", "해당 글을 찾을 수 없습니다."));
    }


}
