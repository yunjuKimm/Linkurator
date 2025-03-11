package com.team8.project2.domain.link.service;

import com.team8.project2.domain.link.dto.LinkReqDTO;
import com.team8.project2.domain.link.entity.Link;
import com.team8.project2.domain.link.repository.LinkRepository;
import com.team8.project2.global.exception.ServiceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LinkServiceTest {
    @Mock
    private LinkRepository linkRepository;

    @InjectMocks
    private LinkService linkService;

    private Link link;

    @BeforeEach
    void setUp() {
        link = new Link().builder()
                .id(1L)
                .url("https://example.com")
                .build();
    }

    // 링크 추가 테스트
    @Test
    void AddLink() {
        // given
        String url = "https://example.com";
        LinkReqDTO linkReqDTO = new LinkReqDTO();
        linkReqDTO.setUrl(url);
        linkReqDTO.setTitle("테스트 제목");
        linkReqDTO.setDescription("테스트 설명");

        when(linkRepository.save(any(Link.class))).thenReturn(link);

        // when
        Link createdLink = linkService.addLink(linkReqDTO);

        // then
        assertNotNull(createdLink);
        assertEquals(url, createdLink.getUrl());
        verify(linkRepository, times(1)).save(any(Link.class));
    }

    // 링크 수정 테스트
    @Test
    void UpdateLink() {
        // given
        Long linkId = 1L;
        String newUrl = "https://updated-example.com";
        when(linkRepository.findById(linkId)).thenReturn(java.util.Optional.of(link));
        when(linkRepository.save(any(Link.class))).thenReturn(link);

        // when
        Link updatedLink = linkService.updateLink(linkId, newUrl);

        // then
        assertNotNull(updatedLink);
        assertEquals(newUrl, updatedLink.getUrl());
        verify(linkRepository, times(1)).save(any(Link.class));
    }

    // 링크 수정 시 링크가 없으면 예외 발생 테스트
    @Test
    void UpdateLinkNotFound() {
        // given
        Long linkId = 1L;
        String newUrl = "https://updated-example.com";
        when(linkRepository.findById(linkId)).thenReturn(java.util.Optional.empty());

        // when & then
        ServiceException exception = assertThrows(ServiceException.class, () -> linkService.updateLink(linkId, newUrl));
        assertEquals("404-1", exception.getCode());
        assertEquals("해당 링크를 찾을 수 없습니다.", exception.getMessage());
    }

    // 링크 삭제 테스트
    @Test
    void DeleteLink() {
        // given
        Long linkId = 1L;
        when(linkRepository.findById(linkId)).thenReturn(Optional.of(link));
        doNothing().when(linkRepository).delete(any(Link.class));

        // when
        linkService.deleteLink(linkId);

        // then
        verify(linkRepository, times(1)).delete(any(Link.class));
    }

    // 링크 삭제 시 링크가 없으면 예외 발생 테스트
    @Test
    void DeleteLinkNotFound() {
        // given
        Long linkId = 1L;
        when(linkRepository.findById(linkId)).thenReturn(java.util.Optional.empty());

        // when & then
        ServiceException exception = assertThrows(ServiceException.class, () -> linkService.deleteLink(linkId));
        assertEquals("404-1", exception.getCode());
        assertEquals("해당 링크를 찾을 수 없습니다.", exception.getMessage());
    }

    // 링크가 존재하지 않으면 생성해서 반환하는 테스트
    @Test
    void GetLink() {
        // given
        String url = "https://example.com";
        when(linkRepository.findByUrl(url)).thenReturn(java.util.Optional.empty());
        when(linkRepository.save(any(Link.class))).thenReturn(link);

        // when
        Link foundLink = linkService.getLink(url);

        // then
        assertNotNull(foundLink);
        assertEquals(url, foundLink.getUrl());
        verify(linkRepository, times(1)).save(any(Link.class));
    }

    // 링크가 존재하면 기존 링크 반환하는 테스트
    @Test
    void GetLinkExisting() {
        // given
        String url = "https://example.com";
        when(linkRepository.findByUrl(url)).thenReturn(java.util.Optional.of(link));

        // when
        Link foundLink = linkService.getLink(url);

        // then
        assertNotNull(foundLink);
        assertEquals(url, foundLink.getUrl());
        verify(linkRepository, times(0)).save(any(Link.class));
    }
}