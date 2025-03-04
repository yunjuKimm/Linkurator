package com.team8.project2.domain.playlist.service;

import com.team8.project2.domain.playlist.dto.PlaylistCreateDto;
import com.team8.project2.domain.playlist.dto.PlaylistDto;
import com.team8.project2.domain.playlist.dto.PlaylistUpdateDto;
import com.team8.project2.domain.playlist.entity.Playlist;
import com.team8.project2.domain.playlist.repository.PlaylistRepository;
import jakarta.persistence.EntityNotFoundException;
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

    /** 플레이리스트 생성 */
    public PlaylistDto createPlaylist(PlaylistCreateDto request) {
        Playlist playlist = Playlist.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .build();
        return PlaylistDto.fromEntity(playlistRepository.save(playlist));
    }

    /** 특정 플레이리스트 조회 */
    public PlaylistDto getPlaylist(Long id) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Playlist not found"));
        return PlaylistDto.fromEntity(playlist);
    }

    /** 모든 플레이리스트 조회 */
    public List<PlaylistDto> getAllPlaylists() {
        return playlistRepository.findAll().stream()
                .map(PlaylistDto::fromEntity)
                .collect(Collectors.toList());
    }

    /** 플레이리스트 수정 */
    public PlaylistDto updatePlaylist(Long id, PlaylistUpdateDto request) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Playlist not found"));

        playlist.setTitle(request.getTitle());
        playlist.setDescription(request.getDescription());

        return PlaylistDto.fromEntity(playlistRepository.save(playlist));
    }

    /** 플레이리스트 삭제 */
    public void deletePlaylist(Long id) {
        if (!playlistRepository.existsById(id)) {
            throw new EntityNotFoundException("Playlist not found");
        }
        playlistRepository.deleteById(id);
    }
}
