package com.team8.project2.domain.playlist.service;

import com.team8.project2.domain.playlist.entity.PlaylistItem;
import com.team8.project2.global.exception.BadRequestException;
import com.team8.project2.global.exception.NotFoundException;
import com.team8.project2.domain.playlist.dto.PlaylistCreateDto;
import com.team8.project2.domain.playlist.dto.PlaylistDto;
import com.team8.project2.domain.playlist.dto.PlaylistUpdateDto;
import com.team8.project2.domain.playlist.entity.Playlist;
import com.team8.project2.domain.playlist.repository.PlaylistRepository;
import com.team8.project2.domain.curation.tag.entity.Tag;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.*;
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
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String VIEW_COUNT_KEY = "playlist:view_count"; // 조회수 저장
    private static final String LIKE_COUNT_KEY = "playlist:like_count"; // 좋아요 수 저장
    private static final String RECOMMEND_KEY = "playlist:recommend:"; // 추천 캐싱

    /** ✅ 플레이리스트 추천 로직 */
    public List<PlaylistDto> recommendPlaylist(Long playlistId) {
        // 1️⃣ Redis에서 캐싱된 추천 데이터 가져오기
        List<Long> cachedRecommendations = (List<Long>) redisTemplate.opsForValue().get(RECOMMEND_KEY + playlistId);
        if (cachedRecommendations != null) {
            return getPlaylistsByIds(cachedRecommendations);
        }

        // 2️⃣ 조회수 기반 추천
        Set<Object> trendingPlaylists = redisTemplate.opsForZSet().reverseRange(VIEW_COUNT_KEY, 0, 9);

        // 3️⃣ 좋아요 기반 추천
        Set<Object> popularPlaylists = redisTemplate.opsForZSet().reverseRange(LIKE_COUNT_KEY, 0, 9);

        // 4️⃣ 유사한 플레이리스트 추천
        Playlist currentPlaylist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new NotFoundException("해당 플레이리스트를 찾을 수 없습니다."));
        List<Playlist> similarPlaylists = playlistRepository.findByTags(currentPlaylist.getTags(), playlistId);

        // 5️⃣ 추천 결과 병합
        Set<Long> recommendedPlaylistIds = new HashSet<>();
        if (trendingPlaylists != null) trendingPlaylists.forEach(id -> recommendedPlaylistIds.add(Long.parseLong(id.toString())));
        if (popularPlaylists != null) popularPlaylists.forEach(id -> recommendedPlaylistIds.add(Long.parseLong(id.toString())));
        similarPlaylists.forEach(p -> recommendedPlaylistIds.add(p.getId()));

        // 6️⃣ Redis에 추천 리스트 캐싱
        redisTemplate.opsForValue().set(RECOMMEND_KEY + playlistId, new ArrayList<>(recommendedPlaylistIds), Duration.ofMinutes(30));

        return getPlaylistsByIds(new ArrayList<>(recommendedPlaylistIds));
    }

    /** ✅ 조회수 증가 */
    public void recordPlaylistView(Long playlistId) {
        redisTemplate.opsForZSet().incrementScore(VIEW_COUNT_KEY, playlistId.toString(), 1);
    }

    /** ✅ 좋아요 증가 */
    public void likePlaylist(Long playlistId) {
        redisTemplate.opsForZSet().incrementScore(LIKE_COUNT_KEY, playlistId.toString(), 1);
    }

    /** ✅ 추천된 Playlist ID 리스트로 PlaylistDto 리스트 반환 */
    private List<PlaylistDto> getPlaylistsByIds(List<Long> playlistIds) {
        List<Playlist> playlists = playlistRepository.findAllById(playlistIds);
        return playlists.stream().map(PlaylistDto::fromEntity).collect(Collectors.toList());
    }


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


    /** 플레이리스트 아이템 추가 */
    public PlaylistDto addPlaylistItem(Long playlistId, Long itemId, PlaylistItem.PlaylistItemType itemType) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new NotFoundException("해당 플레이리스트를 찾을 수 없습니다."));

        int newDisplayOrder = playlist.getItems().size();

        PlaylistItem newItem = PlaylistItem.builder()
                .itemId(itemId)
                .itemType(itemType)
                .playlist(playlist)
                .displayOrder(newDisplayOrder)
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
