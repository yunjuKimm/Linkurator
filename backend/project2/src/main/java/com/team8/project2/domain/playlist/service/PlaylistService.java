package com.team8.project2.domain.playlist.service;

import com.team8.project2.domain.playlist.entity.PlaylistItem;
import com.team8.project2.global.exception.BadRequestException;
import com.team8.project2.global.exception.NotFoundException;
import com.team8.project2.domain.playlist.dto.PlaylistCreateDto;
import com.team8.project2.domain.playlist.dto.PlaylistDto;
import com.team8.project2.domain.playlist.dto.PlaylistUpdateDto;
import com.team8.project2.domain.playlist.entity.Playlist;
import com.team8.project2.domain.playlist.repository.PlaylistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PlaylistService {

    private final PlaylistRepository playlistRepository;

    /** 🔹 플레이리스트 생성 (Member 없이 동작) */
    public PlaylistDto createPlaylist(PlaylistCreateDto request) {
        validatePlaylistData(request.getTitle(), request.getDescription());

        Playlist playlist = Playlist.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .isPublic(request.getIsPublic()) // 공개 여부 설정
                .build();

        return PlaylistDto.fromEntity(playlistRepository.save(playlist));
    }

    /** 🔹 특정 플레이리스트 조회 */
    public PlaylistDto getPlaylist(Long id) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("해당 플레이리스트를 찾을 수 없습니다."));
        return PlaylistDto.fromEntity(playlist);
    }

    /** 🔹 모든 플레이리스트 조회 */
    public List<PlaylistDto> getAllPlaylists() {
        List<Playlist> playlists = playlistRepository.findAll();
        if (playlists.isEmpty()) {
            throw new NotFoundException("등록된 플레이리스트가 없습니다.");
        }
        return playlists.stream()
                .map(PlaylistDto::fromEntity)
                .collect(Collectors.toList());
    }

    /** 🔹 플레이리스트 수정 (Member 없이 동작) */
    public PlaylistDto updatePlaylist(Long id, PlaylistUpdateDto request) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("해당 플레이리스트를 찾을 수 없습니다."));

        // 부분 업데이트 적용
        if (request.getTitle() != null) playlist.setTitle(request.getTitle());
        if (request.getDescription() != null) playlist.setDescription(request.getDescription());
        if (request.getIsPublic() != null) playlist.setPublic(request.getIsPublic());

        return PlaylistDto.fromEntity(playlistRepository.save(playlist));
    }

    /** 🔹 플레이리스트 삭제 (Member 없이 동작) */
    public void deletePlaylist(Long id) {
        if (!playlistRepository.existsById(id)) {
            throw new NotFoundException("해당 플레이리스트를 찾을 수 없습니다.");
        }
        playlistRepository.deleteById(id);
    }

    /** 플레이리스트 제목과 설명 유효성 검사 */
    private void validatePlaylistData(String title, String description) {
        if (title == null || title.trim().isEmpty()) {
            throw new BadRequestException("플레이리스트 제목은 필수 입력 사항입니다.");
        }
        if (description == null || description.trim().isEmpty()) {
            throw new BadRequestException("플레이리스트 설명은 필수 입력 사항입니다.");
        }
    }

    /** 플레이리스트 항목 추가 */
    public PlaylistDto addPlaylistItem(Long playlistId, Long itemId, PlaylistItem.PlaylistItemType itemType) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new NotFoundException("해당 플레이리스트를 찾을 수 없습니다."));

        PlaylistItem newItem = PlaylistItem.builder()
                .itemId(itemId)
                .itemType(itemType)
                .playlist(playlist)
                .build();

        playlist.getItems().add(newItem);
        playlistRepository.save(playlist);

        return PlaylistDto.fromEntity(playlist);
    }

}
