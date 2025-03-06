package com.team8.project2.domain.curation.curation.dto;

import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.curation.tag.entity.Tag;
import com.team8.project2.domain.link.entity.Link;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class CurationResDto {
    private Long id;
    private String title;
    private String content;
    private List<LinkResDto> urls;
    private List<TagResDto> tags;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;
    private Long likeCount;

    @Getter
    @Setter
    static class LinkResDto {
        private String url;

        public LinkResDto(Link link) {
            this.url = link.getUrl();
        }
    }

    @Getter
    @Setter
    static class TagResDto {
        private String name;

        public TagResDto(Tag tag) {
            this.name = tag.getName();
        }
    }

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
