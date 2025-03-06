package com.team8.project2.domain.curation.curation.dto;

import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.curation.tag.entity.Tag;
import com.team8.project2.domain.link.entity.Link;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 큐레이션 응답 DTO 클래스입니다.
 * 클라이언트에 전달할 큐레이션 데이터를 변환하여 제공합니다.
 */
@Getter
@Setter
public class CurationResDto {
    private Long id;

    /** 큐레이션 제목 */
    private String title;

    /** 큐레이션 내용 */
    private String content;

    /** 큐레이션에 포함된 링크 목록 */
    private List<LinkResDto> urls;

    /** 큐레이션에 포함된 태그 목록 */
    private List<TagResDto> tags;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
    private Long likeCount;

    /**
     * 링크 정보를 포함하는 내부 DTO 클래스
     */
    @Getter
    @Setter
    static class LinkResDto {
        private String url;

        public LinkResDto(Link link) {
            this.url = link.getUrl();
        }
    }

    /**
     * 태그 정보를 포함하는 내부 DTO 클래스
     */
    @Getter
    @Setter
    static class TagResDto {
        private String name;

        public TagResDto(Tag tag) {
            this.name = tag.getName();
        }
    }

    /**
     * 큐레이션 엔티티를 DTO로 변환하는 생성자
     * @param curation 변환할 큐레이션 엔티티
     */
    public CurationResDto(Curation curation) {
        this.id = curation.getId();
        this.title = curation.getTitle();
        this.content = curation.getContent();
        this.urls = curation.getCurationLinks().stream()
                .map(cl -> new LinkResDto(cl.getLink()))
                .collect(Collectors.toList());
        this.tags = curation.getTags().stream()
                .map(tag -> new TagResDto(tag.getTag()))
                .collect(Collectors.toList());
        this.createdAt = curation.getCreatedAt();
        this.modifiedAt = curation.getModifiedAt();
        this.likeCount = curation.getLikeCount();
    }
}
