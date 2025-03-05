package com.team8.project2.domain.curation.service;

import com.team8.project2.domain.curation.entity.Curation;
import com.team8.project2.domain.curation.entity.CurationLink;
import com.team8.project2.domain.curation.repository.CurationLinkRepository;
import com.team8.project2.domain.curation.repository.CurationRepository;
import com.team8.project2.domain.link.service.LinkService;
import com.team8.project2.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CurationService {

    private final CurationRepository curationRepository;
    private final CurationLinkRepository curationLinkRepository;
    private final LinkService linkService;


    // 글 생성
    @Transactional
    public Curation createCuration(String title, String content, List<String> urls) {
        Curation curation = Curation.builder()
                .title(title)
                .content(content)
                .build();
        curationRepository.save(curation);

        // 큐레이션 - 링크 연결
        List<CurationLink> curationLinks = urls.stream()
                .map(url -> {
                    CurationLink curationLink = new CurationLink();
                    return curationLink.setCurationAndLink(curation, linkService.getLink(url));
                }).collect(Collectors.toUnmodifiableList());
        for (CurationLink curationLink : curationLinks) {
            curationLinkRepository.save(curationLink);
        }

        curation.setCurationLinks(curationLinks);
        return curation;
    }

    // 글 수정
    @Transactional
    public Curation updateCuration(Long curationId, String title, String content, List<String> urls) {

        Curation curation = curationRepository.findById(curationId)
                .orElseThrow(() -> new ServiceException("404-1", "해당 글을 찾을 수 없습니다."));

        curation.setTitle(title);
        curation.setContent(content);


        // 큐레이션 - 링크 연결
        List<CurationLink> curationLinks = urls.stream()
                .map(url -> {
                    CurationLink curationLink = new CurationLink();
                    return curationLink.setCurationAndLink(curation, linkService.getLink(url));
                }).collect(Collectors.toUnmodifiableList());
        for (CurationLink curationLink : curationLinks) {
            curationLinkRepository.save(curationLink);
        }

        return curationRepository.save(curation);
    }

    // 글 삭제
    @Transactional
    public void deleteCuration(Long curationId) {
        if (!curationRepository.existsById(curationId)) {
            throw new ServiceException("404-1", "해당 글을 찾을 수 없습니다.");
        }
        curationLinkRepository.deleteByCurationId(curationId);
        curationRepository.deleteById(curationId);
    }

    // 글 조회
    public Curation getCuration(Long curationId) {
        return curationRepository.findById(curationId)
                .orElseThrow(() -> new ServiceException("404-1", "해당 글을 찾을 수 없습니다."));
    }
}
