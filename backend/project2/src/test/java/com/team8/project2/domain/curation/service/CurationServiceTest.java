package com.team8.project2.domain.curation.service;


import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.curation.curation.entity.CurationLink;
import com.team8.project2.domain.curation.curation.entity.CurationTag;
import com.team8.project2.domain.curation.curation.entity.SearchOrder;
import com.team8.project2.domain.curation.curation.repository.CurationLinkRepository;
import com.team8.project2.domain.curation.curation.repository.CurationRepository;
import com.team8.project2.domain.curation.curation.repository.CurationTagRepository;
import com.team8.project2.domain.curation.curation.service.CurationService;
import com.team8.project2.domain.curation.tag.entity.Tag;
import com.team8.project2.domain.curation.tag.service.TagService;
import com.team8.project2.domain.link.entity.Link;
import com.team8.project2.domain.link.service.LinkService;
import com.team8.project2.global.exception.ServiceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CurationServiceTest {

    @Mock
    private CurationRepository curationRepository;

    @Mock
    private CurationLinkRepository curationLinkRepository;

    @Mock
    private CurationTagRepository curationTagRepository;

    @Mock
    private LinkService linkService;

    @Mock
    private TagService tagService;

    @InjectMocks
    private CurationService curationService;

    private Curation curation;
    private Link link;
    private Tag tag;

    @BeforeEach
    public void setup() {
        curation = Curation.builder()
                .id(1L)
                .title("Test Title")
                .content("Test Content")
                .build();

        link = Link.builder()
                .id(1L)
                .url("https://test.com")
                .build();

        tag = Tag.builder()
                .name("test")
                .build();
    }

    @Test
    @DisplayName("큐레이션을 생성할 수 있다")
    void createCuration() {
        List<String> urls = Arrays.asList("http://example.com", "http://another-url.com");
        List<String> tags = Arrays.asList("tag1", "tag2", "tag3");

        // Mocking repository and service calls
        when(linkService.getLink(anyString())).thenReturn(link);
        when(tagService.getTag(anyString())).thenReturn(tag);
        when(curationRepository.save(any(Curation.class))).thenReturn(curation);
        when(curationLinkRepository.save(any(CurationLink.class))).thenReturn(new CurationLink());

        Curation createdCuration = curationService.createCuration("New Title", "New Content", urls, tags);

        // Verify interactions
        verify(curationRepository, times(1)).save(any(Curation.class));
        verify(curationLinkRepository, times(2)).save(any(CurationLink.class));
        verify(curationTagRepository, times(3)).save(any(CurationTag.class));

        // Check the result
        assert createdCuration != null;
        assert createdCuration.getTitle().equals("New Title");
    }

    @Test
    @DisplayName("큐레이션을 수정할 수 있다")
    void UpdateCuration() {
        List<String> urls = Arrays.asList("http://updated-url.com", "http://another-url.com");
        List<String> tags = Arrays.asList("updated-tag1", "updated-tag2", "updated-tag3");

        // Mocking repository and service calls
        when(curationRepository.findById(anyLong())).thenReturn(Optional.of(curation));
        when(linkService.getLink(anyString())).thenReturn(link);
        when(tagService.getTag(anyString())).thenReturn(tag);
        when(curationRepository.save(any(Curation.class))).thenReturn(curation);
        when(curationLinkRepository.saveAll(ArgumentMatchers.anyList())).thenReturn(List.of(new CurationLink()));
        when(curationTagRepository.saveAll(ArgumentMatchers.anyList())).thenReturn(List.of(new CurationTag()));

        Curation updatedCuration = curationService.updateCuration(1L, "Updated Title", "Updated Content", urls, tags);

        // Verify interactions
        verify(curationRepository, times(1)).findById(anyLong());
        verify(curationRepository, times(1)).save(any(Curation.class));
        verify(curationLinkRepository, times(1)).saveAll(ArgumentMatchers.anyList());
        verify(curationTagRepository, times(1)).saveAll(ArgumentMatchers.anyList());

        // Check the result
        assert updatedCuration != null;
        assert updatedCuration.getTitle().equals("Updated Title");
    }

    @Test
    @DisplayName("실패 - 존재하지 않는 큐레이션을 수정하면 실패한다")
    void UpdateCurationNotFound() {
        List<String> urls = Arrays.asList("http://updated-url.com");
        List<String> tags = Arrays.asList("tag1", "tag2", "tag3");

        // Mocking repository to return empty Optional
        when(curationRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Check if exception is thrown
        try {
            curationService.updateCuration(1L, "Updated Title", "Updated Content", urls, tags);
        } catch (ServiceException e) {
            assert e.getMessage().contains("해당 글을 찾을 수 없습니다.");
        }
    }

    @Test
    @DisplayName("큐레이션을 삭제할 수 있다")
    void DeleteCuration() {
        // Mocking repository to return true for existence check
        when(curationRepository.existsById(anyLong())).thenReturn(true);

        curationService.deleteCuration(1L);

        // Verify delete operation
        verify(curationRepository, times(1)).deleteById(anyLong());
    }

    @Test
    @DisplayName("실패 - 존재하지 않는 큐레이션을 삭제할 수 없다")
    void DeleteCurationNotFound() {
        // Mocking repository to return false for existence check
        when(curationRepository.existsById(anyLong())).thenReturn(false);

        // Check if exception is thrown
        try {
            curationService.deleteCuration(1L);
        } catch (ServiceException e) {
            assert e.getMessage().contains("해당 글을 찾을 수 없습니다.");
        }
    }

    @Test
    @DisplayName("큐레이션을 조회할 수 있다")
    void GetCuration() {
        // Mocking repository to return a Curation
        when(curationRepository.findById(anyLong())).thenReturn(Optional.of(curation));

        Curation retrievedCuration = curationService.getCuration(1L);

        // Verify the result
        assert retrievedCuration != null;
        assert retrievedCuration.getTitle().equals("Test Title");
    }

    @Test
    @DisplayName("실패 - 존재하지 않는 큐레이션을 조회하면 실패한다")
    void GetCurationNotFound() {
        // Mocking repository to return empty Optional
        when(curationRepository.findById(anyLong())).thenReturn(Optional.empty());

        // Check if exception is thrown
        try {
            curationService.getCuration(1L);
        } catch (ServiceException e) {
            assert e.getMessage().contains("해당 글을 찾을 수 없습니다.");
        }
    }

    @Test
    void findAllCuration() {
        when(curationRepository.searchByFilters(ArgumentMatchers.anyList(), anyString(), anyString(), any()))
                .thenReturn(List.of(curation));

        List<Curation> foundCurations = curationService.searchCurations(List.of("tag"), "title", "content", SearchOrder.LATEST);

        // Verify the result
        assert foundCurations != null;
        assert foundCurations.size() == 1;
    }
}