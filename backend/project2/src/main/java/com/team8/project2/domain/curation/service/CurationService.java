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
    public Curation updateCuration(Long curationId, Curation updatedCuration) {
        Optional<Curation> curationOptional = curationRepository.findById(curationId);
        if (curationOptional.isPresent()) {
            Curation curation = curationOptional.get();
            curation.setTitle(updatedCuration.getTitle());
            curation.setContent(updatedCuration.getContent());
            curation.setModifiedAt(LocalDateTime.now());
            return curationRepository.save(curation);
        }
        throw new RuntimeException("Curation not found");
    }

    // 글 삭제
    public void deleteCuration(Long curationId) {
        curationRepository.deleteById(curationId);
    }

    // 글 조회
    public Optional<Curation> getCuration(Long curationId) {
        return curationRepository.findById(curationId);
    }


}
