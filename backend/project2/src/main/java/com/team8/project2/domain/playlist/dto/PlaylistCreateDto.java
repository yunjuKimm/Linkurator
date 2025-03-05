package com.team8.project2.domain.playlist.dto;

import lombok.Data;

@Data
public class PlaylistCreateDto {
    private String title;
    private String description;
    private Boolean isPublic = true;

    public Boolean getIsPublic() {
        return isPublic != null ? isPublic : true;
    }

}
