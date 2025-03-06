package com.team8.project2.domain.link.service;

import com.team8.project2.domain.link.dto.LinkResDTO;
import com.team8.project2.domain.link.entity.Link;
import com.team8.project2.domain.link.repository.LinkRepository;
import com.team8.project2.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class LinkService {

    private final LinkRepository linkRepository;

    // 링크 추가
    @Transactional
    public Link addLink(String url) {
        Link link = new Link();
        link.setUrl(url);
        link.setClick(0); // 초기 클릭수
        return linkRepository.save(link);
    }

    // 링크 수정
    @Transactional
    public Link updateLink(Long linkId, String url) {
        Link link = linkRepository.findById(linkId)
                .orElseThrow(() -> new ServiceException("404-1", "해당 링크를 찾을 수 없습니다."));
        link.setUrl(url);
        return linkRepository.save(link);
    }

    // 링크 삭제
    @Transactional
    public void deleteLink(Long linkId) {
        Link link = linkRepository.findById(linkId)
                .orElseThrow(() -> new ServiceException("404-1", "해당 링크를 찾을 수 없습니다."));
        linkRepository.delete(link);
    }

    // 링크가 존재하면 존재하는 링크, 존재하지 않으면 생성해 반환
    @Transactional
    public Link getLink(String url) {
        return linkRepository.findByUrl(url)
                .orElseGet(() -> linkRepository.save(Link.builder().url(url).build()));
    }

    // 링크 메타 데이터 추출
    @Transactional
    public LinkResDTO getLinkMetaData(String url) {
        try {
            // Jsoup을 사용하여 URL의 HTML을 파싱
            Document doc = Jsoup.connect(url).get();

            // 메타 데이터 추출
            String title = getMetaTagContent(doc, "og:title");
            String description = getMetaTagContent(doc, "og:description");
            String image = getMetaTagContent(doc, "og:image");

            // DTO에 메타 데이터 설정
            LinkResDTO linkResDTO = new LinkResDTO();
            linkResDTO.setUrl(url);
            linkResDTO.setTitle(title);
            linkResDTO.setDescription(description);
            linkResDTO.setImage(image);

            return linkResDTO;
        } catch (IOException e) {
            // 예외 발생 시 커스텀 예외 던지기
            throw new ServiceException("500-1", "메타 데이터 추출 중 오류가 발생했습니다.");
        }
    }

    // 메타 태그 내용 추출 유틸리티 함수
    private String getMetaTagContent(Document doc, String property) {
        Element metaTag = doc.select("meta[property=" + property + "]").first();
        return metaTag != null ? metaTag.attr("content") : "";
    }
}
