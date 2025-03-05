package com.team8.project2.domain.playlist.dto;

import lombok.Data;

@Data
public class PlaylistUpdateDto {
    private String title;
    private String description;
    private Boolean isPublic; // 🔹 추가

    public Boolean getIsPublic() {
        return isPublic; // 🔹 기본값 처리 필요 시 추가 가능
    }
}
