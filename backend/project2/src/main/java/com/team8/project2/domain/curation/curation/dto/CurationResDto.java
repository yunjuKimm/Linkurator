package com.team8.project2.domain.curation.curation.dto;

import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.curation.tag.entity.Tag;
import com.team8.project2.domain.link.entity.Link;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class CurationResDto {
    private String title;
    private String content;
    private List<LinkResDto> urls;
    private List<TagResDto> tags;

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
        this.title = curation.getTitle();
        this.content = curation.getContent();
        this.urls = curation.getCurationLinks().stream()
                .map(cl -> new LinkResDto(cl.getLink()))
                .collect(Collectors.toList());
        this.tags = curation.getTags().stream()
                .map(tag -> new TagResDto(tag.getTag()))
                .collect(Collectors.toList());
    }
}
