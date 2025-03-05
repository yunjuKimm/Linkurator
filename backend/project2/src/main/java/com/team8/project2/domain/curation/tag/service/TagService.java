package com.team8.project2.domain.curation.tag.service;

import com.team8.project2.domain.curation.curation.repository.CurationRepository;
import com.team8.project2.domain.curation.tag.entity.Tag;
import com.team8.project2.domain.curation.tag.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 태그(Tag) 관련 비즈니스 로직을 처리하는 서비스 클래스입니다.
 * 태그 조회 및 생성 기능을 제공합니다.
 */
@RequiredArgsConstructor
@Service
public class TagService {

    private final TagRepository tagRepository;
    private final CurationRepository curationRepository;

    /**
     * 태그가 존재하면 기존 태그를 반환하고, 존재하지 않으면 새로 생성하여 반환합니다.
     * @param name 태그 이름
     * @return 기존 또는 새로 생성된 태그 객체
     */
    public Tag getTag(String name) {
        return tagRepository.findByName(name)
                .orElseGet(() -> tagRepository.save(Tag.builder().name(name).build()));
    }
}