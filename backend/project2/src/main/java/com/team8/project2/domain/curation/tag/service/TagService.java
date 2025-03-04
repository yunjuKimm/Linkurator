package com.team8.project2.domain.curation.tag.service;

import com.team8.project2.domain.curation.tag.entity.Tag;
import com.team8.project2.domain.curation.tag.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class TagService {

    private final TagRepository tagRepository;

    // 태그가 존재하면 존재하는 태그, 존재하지 않으면 생성해 반환
    public Tag getTag(String name) {
        return tagRepository.findByName(name)
                .orElseGet(() -> tagRepository.save(Tag.builder().name(name).build()));
    }
}
