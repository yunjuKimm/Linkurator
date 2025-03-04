package com.team8.project2.domain.playlist.dto;

import com.team8.project2.domain.playlist.entity.Playlist;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class PlaylistDto {
    private Long id;
    private String title;
    private String description;
    private List<PlaylistItemDto> items; // 응답에서 항목 리스트 포함

    public static PlaylistDto fromEntity(Playlist playlist) {
        return PlaylistDto.builder()
                .id(playlist.getId())
                .title(playlist.getTitle())
                .description(playlist.getDescription())
                .items(playlist.getItems().stream().map(PlaylistItemDto::fromEntity).collect(Collectors.toList()))
                .build();
    }
}

