package com.team8.project2.domain.link.service;

import com.team8.project2.domain.link.entity.Link;
import com.team8.project2.domain.link.repository.LinkRepository;
import com.team8.project2.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LinkService {

    private final LinkRepository linkRepository;

    // 링크 추가
    @Transactional
    public Link addLink(String url, String title, String description, String thumbnail) {
        Link link = new Link();
        link.setUrl(url);
        link.setTitle(title);
        link.setClick(0); // 초기 클릭수
        link.setDescription(description);
        link.setCreatedAt(LocalDateTime.now());
        link.setThumbnail(thumbnail);

        return linkRepository.save(link);
    }

    // 링크 수정
    @Transactional
    public Link updateLink(Long linkId, String title, String description, String thumbnail) {
        Link link = linkRepository.findById(linkId)
                .orElseThrow(() -> new ServiceException("404-1", "해당 링크를 찾을 수 없습니다."));

        link.setTitle(title);
        link.setDescription(description);
        link.setThumbnail(thumbnail);
        return linkRepository.save(link);
    }

    // 링크 삭제
    @Transactional
    public void deleteLink(Long linkId) {
        Link link = linkRepository.findById(linkId)
                .orElseThrow(() -> new ServiceException("404-1", "해당 링크를 찾을 수 없습니다."));
        linkRepository.delete(link);
    }

}
