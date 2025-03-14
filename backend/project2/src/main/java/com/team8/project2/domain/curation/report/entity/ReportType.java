package com.team8.project2.domain.curation.report.entity;

public enum ReportType {
	ABUSE("욕설 및 비방"),
	SPAM("스팸 및 광고"),
	FALSE_INFO("허위 정보 또는 불법 콘텐츠"),
	INAPPROPRIATE("부적절한 내용 (음란물, 폭력 등)");

	private final String description;

	ReportType(String description) {
		this.description = description;
	}

	public String getDescription() {
		return description;
	}
}
