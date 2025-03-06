package com.team8.project2.domain.link.service;

import com.team8.project2.domain.link.entity.Link;
import com.team8.project2.domain.link.repository.LinkRepository;
import com.team8.project2.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 링크(Link) 관련 비즈니스 로직을 처리하는 서비스 클래스입니다.
 * 링크 추가, 수정, 삭제 및 조회 기능을 제공합니다.
 */
@Service
@RequiredArgsConstructor
public class LinkService {

    private final LinkRepository linkRepository;

    /**
     * 새로운 링크를 추가합니다.
     * @param url 추가할 링크 URL
     * @return 생성된 링크 객체
     */
    @Transactional
    public Link addLink(String url) {
        Link link = new Link();
        link.setUrl(url);
        link.setClick(0); // 초기 클릭수
        return linkRepository.save(link);
    }

    /**
     * 기존 링크를 수정합니다.
     * @param linkId 수정할 링크 ID
     * @param url 새로운 링크 URL
     * @return 수정된 링크 객체
     */
    @Transactional
    public Link updateLink(Long linkId, String url) {
        Link link = linkRepository.findById(linkId)
                .orElseThrow(() -> new ServiceException("404-1", "해당 링크를 찾을 수 없습니다."));
        link.setUrl(url);
        return linkRepository.save(link);
    }

    /**
     * 특정 링크를 삭제합니다.
     * @param linkId 삭제할 링크 ID
     */
    @Transactional
    public void deleteLink(Long linkId) {
        Link link = linkRepository.findById(linkId)
                .orElseThrow(() -> new ServiceException("404-1", "해당 링크를 찾을 수 없습니다."));
        linkRepository.delete(link);
    }

    /**
     * 링크가 존재하면 기존 링크를 반환하고, 존재하지 않으면 새로 생성하여 반환합니다.
     * @param url 조회할 링크 URL
     * @return 기존 또는 새로 생성된 링크 객체
     */
    @Transactional
    public Link getLink(String url) {
        return linkRepository.findByUrl(url)
                .orElseGet(() -> linkRepository.save(Link.builder().url(url).build()));
    }
}
