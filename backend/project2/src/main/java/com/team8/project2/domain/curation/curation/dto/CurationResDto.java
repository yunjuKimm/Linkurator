package com.team8.project2.domain.curation.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.team8.project2.domain.curation.entity.Curation;
import com.team8.project2.domain.link.entity.Link;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CurationResDto {
	private String title;
	private String content;
	private List<LinkResDto> urls;

	@Getter
	@Setter
	static class LinkResDto {
		private String url;

		public LinkResDto(Link link) {
			this.url = link.getUrl();
		}
	}

	public CurationResDto(Curation createdCuration) {
		this.title = createdCuration.getTitle();
		this.content = createdCuration.getContent();
		this.urls = createdCuration.getCurationLinks().stream()
			.map(cl -> new LinkResDto(cl.getLink()))
			.collect(Collectors.toList());
	}
}
