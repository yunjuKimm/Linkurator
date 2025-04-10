package com.team8.project2.domain.link.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * 링크 생성 및 수정 요청을 위한 DTO 클래스입니다.
 * 클라이언트가 전송하는 링크 데이터를 검증하고 전달합니다.
 */
@Getter
@Setter
public class LinkReqDTO {

    /**
     * 링크 URL (필수값)
     */
    @NotNull
    private String url;


    /**
     * 링크 TITLE (필수값)
     */
    private String title;

    private String description;

}
