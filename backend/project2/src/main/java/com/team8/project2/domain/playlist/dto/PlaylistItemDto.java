package com.team8.project2.domain.playlist.dto;

import com.team8.project2.domain.playlist.entity.PlaylistItem;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PlaylistItemDto {
    private Long id;
    private Long itemId;
    private String itemType;

    public static PlaylistItemDto fromEntity(PlaylistItem playlistItem) {
        return PlaylistItemDto.builder()
                .id(playlistItem.getId())
                .itemId(playlistItem.getItemId())
                .itemType(playlistItem.getItemType().name())
                .build();
    }
}
