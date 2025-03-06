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
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 플레이리스트(Playlist) 관련 비즈니스 로직을 처리하는 서비스 클래스입니다.
 * 플레이리스트 생성, 조회, 수정, 삭제 기능을 제공합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class PlaylistService {

    private final PlaylistRepository playlistRepository;

    /**
     * 새로운 플레이리스트를 생성합니다.
     *
     * @param request 플레이리스트 생성 요청 데이터
     * @return 생성된 플레이리스트 DTO
     */
    public PlaylistDto createPlaylist(PlaylistCreateDto request) {
        // ✅ Bean Validation이 Controller 레벨에서 이미 수행되므로,
        // 아래 validatePlaylistData 호출을 제거합니다.
        // validatePlaylistData(request.getTitle(), request.getDescription()); // 삭제됨

        Playlist playlist = Playlist.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .isPublic(request.getIsPublic())
                .build();

        return PlaylistDto.fromEntity(playlistRepository.save(playlist));
    }

    /**
     * 특정 플레이리스트를 조회합니다.
     *
     * @param id 조회할 플레이리스트 ID
     * @return 조회된 플레이리스트 DTO
     */
    public PlaylistDto getPlaylist(Long id) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("해당 플레이리스트를 찾을 수 없습니다."));
        return PlaylistDto.fromEntity(playlist);
    }

    /**
     * 모든 플레이리스트를 조회합니다.
     *
     * @return 플레이리스트 목록 DTO 리스트
     * 예외 대신 빈 리스트 반환
     */
    public List<PlaylistDto> getAllPlaylists() {
        List<Playlist> playlists = playlistRepository.findAll();

        return playlists.stream()
                .map(PlaylistDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 기존 플레이리스트를 수정합니다.
     *
     * @param id 수정할 플레이리스트 ID
     * @param request 수정할 데이터
     * @return 수정된 플레이리스트 DTO
     */
    public PlaylistDto updatePlaylist(Long id, PlaylistUpdateDto request) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("해당 플레이리스트를 찾을 수 없습니다."));

        // 부분 업데이트 적용
        if (request.getTitle() != null) playlist.setTitle(request.getTitle());
        if (request.getDescription() != null) playlist.setDescription(request.getDescription());
        if (request.getIsPublic() != null) playlist.setPublic(request.getIsPublic());

        return PlaylistDto.fromEntity(playlistRepository.save(playlist));
    }

    /**
     * 플레이리스트를 삭제합니다.
     *
     * @param id 삭제할 플레이리스트 ID
     */
    public void deletePlaylist(Long id) {
        if (!playlistRepository.existsById(id)) {
            throw new NotFoundException("해당 플레이리스트를 찾을 수 없습니다.");
        }
        playlistRepository.deleteById(id);
    }

    /**
     * 플레이리스트 제목과 설명의 유효성을 검사합니다.
     *
     * @param title 제목
     * @param description 설명
     */
    // ✅ 삭제: Bean Validation 적용으로 인해 해당 검증 메서드가 더 이상 필요하지 않습니다.
//    private void validatePlaylistData(String title, String description) {
//        if (title == null || title.trim().isEmpty()) {
//            throw new BadRequestException("플레이리스트 제목은 필수 입력 사항입니다.");
//        }
//        if (description == null || description.trim().isEmpty()) {
//            throw new BadRequestException("플레이리스트 설명은 필수 입력 사항입니다.");
//        }
//    }

    /** 플레이리스트 아이템 추가 */
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

    /** 플레이리스트 아이템 삭제 */
    @Transactional
    public void deletePlaylistItem(Long playlistId, Long itemId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new NotFoundException("해당 플레이리스트를 찾을 수 없습니다."));

        boolean removed = playlist.getItems().removeIf(item -> item.getItemId().equals(itemId));
        if (!removed) {
            throw new NotFoundException("해당 플레이리스트 아이템을 찾을 수 없습니다.");
        }

        playlistRepository.save(playlist);
    }

    /** 플레이리스트 아이템 순서 변경 */
    @Transactional
    public PlaylistDto updatePlaylistItemOrder(Long playlistId, List<Long> orderedItemIds) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new NotFoundException("해당 플레이리스트를 찾을 수 없습니다."));

        if (playlist.getItems().size() != orderedItemIds.size()) {
            throw new BadRequestException("플레이리스트 아이템 개수가 일치하지 않습니다.");
        }

        Map<Long, PlaylistItem> itemMap = playlist.getItems().stream()
                .collect(Collectors.toMap(PlaylistItem::getId, Function.identity()));

        for (int i = 0; i < orderedItemIds.size(); i++) {
            Long playlistItemId = orderedItemIds.get(i);
            PlaylistItem item = itemMap.get(playlistItemId);
            if (item != null) {
                item.setDisplayOrder(i);
            } else {
                throw new BadRequestException("존재하지 않는 플레이리스트 아이템 ID가 포함되어 있습니다.");
            }
        }

        playlistRepository.save(playlist);
        return PlaylistDto.fromEntity(playlist);
    }
}
