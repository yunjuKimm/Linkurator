package com.team8.project2.domain.playlist.dto;

import lombok.Data;

/**
 * 플레이리스트 생성 요청을 위한 DTO 클래스입니다.
 * 클라이언트가 전송하는 플레이리스트 데이터를 검증하고 전달합니다.
 */
@Data
public class PlaylistCreateDto {

    /**
     * 플레이리스트 제목
     */
    private String title;

    /**
     * 플레이리스트 설명
     */
    private String description;

    /**
     * 플레이리스트 공개 여부 (기본값: true)
     */
    private Boolean isPublic = true;

    /**
     * 공개 여부가 null일 경우 기본값(true) 반환
     * @return 공개 여부 값
     */
    public Boolean getIsPublic() {
        return isPublic != null ? isPublic : true;
    }
}