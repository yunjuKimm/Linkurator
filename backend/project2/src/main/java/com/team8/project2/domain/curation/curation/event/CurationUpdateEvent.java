package com.team8.project2.domain.curation.curation.event;

import java.util.ArrayList;
import java.util.List;

import lombok.Builder;

@Builder
public class CurationUpdateEvent {
	private Long curationId;
	private List<String> imageUrls = new ArrayList<>();
}
