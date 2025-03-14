package com.team8.project2.domain.playlist.service;

import com.team8.project2.domain.member.entity.Member;
import com.team8.project2.domain.member.repository.MemberRepository;
import com.team8.project2.domain.playlist.dto.PlaylistCreateDto;
import com.team8.project2.domain.playlist.dto.PlaylistDto;
import com.team8.project2.domain.playlist.dto.PlaylistLike;
import com.team8.project2.domain.playlist.dto.PlaylistUpdateDto;
import com.team8.project2.domain.playlist.entity.Playlist;
import com.team8.project2.domain.playlist.entity.PlaylistItem;
import com.team8.project2.domain.playlist.repository.PlaylistLikeRepository;
import com.team8.project2.domain.playlist.repository.PlaylistRepository;
import com.team8.project2.global.exception.BadRequestException;
import com.team8.project2.global.exception.NotFoundException;
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
    private final MemberRepository memberRepository;
    private final PlaylistLikeRepository playlistLikeRepository;
    private static final String VIEW_COUNT_KEY = "playlist:view_count"; // 조회수 저장
    private static final String LIKE_COUNT_KEY = "playlist:like_count"; // 좋아요 수 저장
    private static final String RECOMMEND_KEY = "playlist:recommend:"; // 추천 캐싱


    /**
     * ✅ 플레이리스트 추천 로직
     * - 24시간 내 인기 추천 포함
     * - 태그 기반 유사 플레이리스트 추천
     * - 정렬 기준 (좋아요, 조회수, 복합)
     */
    public List<PlaylistDto> recommendPlaylist(Long playlistId, String sortType) {
        String cachedRecommendationsStr = (String) redisTemplate.opsForValue().get(RECOMMEND_KEY + playlistId);
        if (cachedRecommendationsStr != null) {
            List<Long> cachedRecommendations = Arrays.stream(cachedRecommendationsStr.split(","))
                    .map(Long::parseLong)
                    .collect(Collectors.toList());
            return getPlaylistsByIds(cachedRecommendations);
        }

        // 1️⃣ 최근 24시간 동안 인기 플레이리스트 추천
        Set<Object> trendingRecent = redisTemplate.opsForZSet().reverseRange("trending:24h", 0, 5);
        Set<Object> popularRecent = redisTemplate.opsForZSet().reverseRange("popular:24h", 0, 5);

        // 2️⃣ 전체 인기 플레이리스트 추천 (조회수 + 좋아요)
        Set<Object> trendingPlaylists = redisTemplate.opsForZSet().reverseRange(VIEW_COUNT_KEY, 0, 5);
        Set<Object> popularPlaylists = redisTemplate.opsForZSet().reverseRange(LIKE_COUNT_KEY, 0, 5);

        // 3️⃣ 태그 기반 유사 플레이리스트 추천
        Playlist currentPlaylist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new NotFoundException("해당 플레이리스트를 찾을 수 없습니다."));

        List<Playlist> similarPlaylists = findSimilarPlaylistsByTag(currentPlaylist);

        // 4️⃣ 추천 결과 병합
        Set<Long> recommendedPlaylistIds = new HashSet<>();
        addRecommendations(recommendedPlaylistIds, trendingRecent);
        addRecommendations(recommendedPlaylistIds, popularRecent);
        addRecommendations(recommendedPlaylistIds, trendingPlaylists);
        addRecommendations(recommendedPlaylistIds, popularPlaylists);
        similarPlaylists.forEach(p -> recommendedPlaylistIds.add(p.getId()));

        // 5️⃣ Redis에 추천 데이터 캐싱 (30분 유지)
        redisTemplate.opsForValue().set(RECOMMEND_KEY + playlistId, recommendedPlaylistIds.stream().map(String::valueOf).collect(Collectors.joining(",")), Duration.ofMinutes(30));

        // 6️⃣ 정렬 기준 적용
        return getSortedPlaylists(new ArrayList<>(recommendedPlaylistIds), sortType);
    }

    /**
     * ✅ 태그 기반 유사 플레이리스트 찾기
     * - 3개 이상의 태그가 일치하면 유사한 플레이리스트로 추천
     * - 3개 미만이면 랜덤 추천
     */
    private List<Playlist> findSimilarPlaylistsByTag(Playlist currentPlaylist) {
        List<Playlist> allPlaylists = playlistRepository.findAll();
        List<Playlist> similarPlaylists = new ArrayList<>();

        for (Playlist other : allPlaylists) {
            if (!other.getId().equals(currentPlaylist.getId())) {
                Set<String> commonTags = new HashSet<>(currentPlaylist.getTagNames()); // ✅ 수정
                commonTags.retainAll(other.getTagNames()); // ✅ 수정

                if (commonTags.size() >= 3) {
                    similarPlaylists.add(other);
                }
            }
        }

        if (similarPlaylists.isEmpty()) {
            Collections.shuffle(allPlaylists);
            return allPlaylists.stream().limit(5).collect(Collectors.toList());
        }

        return similarPlaylists;
    }

    /**
     * ✅ 정렬 기준에 따라 플레이리스트 정렬
     * - 좋아요 순, 조회수 순, 복합 점수 순
     */
    private List<PlaylistDto> getSortedPlaylists(List<Long> playlistIds, String sortType) {
        List<Playlist> playlists = new ArrayList<>(playlistRepository.findAllById(playlistIds));

        switch (sortType) {
            case "likes":
                playlists.sort(Comparator.comparingLong(Playlist::getLikeCount).reversed());
                break;
            case "views":
                playlists.sort(Comparator.comparingLong(Playlist::getViewCount).reversed());
                break;
            case "combined":
                playlists.sort(Comparator.comparingLong((Playlist p) -> p.getViewCount() + p.getLikeCount()).reversed());
                break;
            default:
                break;
        }

        return playlists.stream().map(PlaylistDto::fromEntity).collect(Collectors.toList());
    }

    /** ✅ 추천된 Playlist ID 리스트로 PlaylistDto 리스트 반환 */
    private List<PlaylistDto> getPlaylistsByIds(List<Long> playlistIds) {
        List<Playlist> playlists = playlistRepository.findAllById(playlistIds);
        return playlists.stream().map(PlaylistDto::fromEntity).collect(Collectors.toList());
    }

    /** ✅ 조회수 증가 */
    public void recordPlaylistView(Long playlistId) {
        redisTemplate.opsForZSet().incrementScore(VIEW_COUNT_KEY, playlistId.toString(), 1);
    }

    /** ✅ 조회수 증가 (10분 제한) */
//    public void recordPlaylistView(Long playlistId, Long memberId) {
//        String viewKey = "viewed:" + memberId + ":" + playlistId; // Redis 키 생성
//
//        // Redis에 해당 키가 있는지 확인 (이미 조회한 경우)
//        Boolean isViewed = redisTemplate.hasKey(viewKey);
//        if (Boolean.TRUE.equals(isViewed)) {
//            return; // 10분 내에 조회한 경우, 조회수를 증가시키지 않음
//        }
//
//        // Redis에 조회 기록 저장 (10분 TTL)
//        redisTemplate.opsForValue().set(viewKey, "true", Duration.ofMinutes(10));
//
//        // 조회수 증가
//        redisTemplate.opsForZSet().incrementScore(VIEW_COUNT_KEY, playlistId.toString(), 1);
//
//        // DB에서도 조회수 반영 (선택적)
//        Playlist playlist = playlistRepository.findById(playlistId)
//                .orElseThrow(() -> new NotFoundException("해당 플레이리스트를 찾을 수 없습니다."));
//        playlist.incrementViewCount();
//        playlistRepository.save(playlist);
//    }


//    /** ✅ 좋아요 증가 */
//    public void likePlaylist(Long playlistId) {
//        redisTemplate.opsForZSet().incrementScore(LIKE_COUNT_KEY, playlistId.toString(), 1);
//    }

    @Transactional
    public void likePlaylist(Long playlistId, Long memberId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new NotFoundException("해당 플레이리스트를 찾을 수 없습니다."));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new NotFoundException("해당 사용자를 찾을 수 없습니다."));

        Optional<PlaylistLike> existingLike = playlistLikeRepository.findByPlaylistAndMember(playlist, member);

        if (existingLike.isPresent()) {
            playlistLikeRepository.delete(existingLike.get());

            Double currentLikes = redisTemplate.opsForZSet().score(LIKE_COUNT_KEY, playlistId.toString());
            if (currentLikes != null && currentLikes > 0) {
                redisTemplate.opsForZSet().incrementScore(LIKE_COUNT_KEY, playlistId.toString(), -1);
                playlist.setLikeCount(currentLikes.longValue() - 1);
            } else {
                playlist.setLikeCount(0L);
            }

        } else {
            PlaylistLike newLike = PlaylistLike.createLike(playlist, member);
            playlistLikeRepository.save(newLike);

            redisTemplate.opsForZSet().incrementScore(LIKE_COUNT_KEY, playlistId.toString(), 1);
            playlist.setLikeCount(redisTemplate.opsForZSet().score(LIKE_COUNT_KEY, playlistId.toString()).longValue());
        }

        playlistRepository.save(playlist);
    }


    /** ✅ 좋아요 취소 */
    @Transactional
    public void unlikePlaylist(Long playlistId, Long memberId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new NotFoundException("해당 플레이리스트를 찾을 수 없습니다."));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new NotFoundException("해당 사용자를 찾을 수 없습니다."));

        Optional<PlaylistLike> existingLike = playlistLikeRepository.findByPlaylistAndMember(playlist, member);

        if (existingLike.isPresent()) {
            playlistLikeRepository.delete(existingLike.get());
            redisTemplate.opsForZSet().incrementScore(LIKE_COUNT_KEY, playlistId.toString(), -1);
        }
    }

    /** ✅ 추천 리스트 병합 */
    private void addRecommendations(Set<Long> recommendedPlaylistIds, Set<Object> redisResults) {
        if (redisResults != null) {
            redisResults.forEach(id -> recommendedPlaylistIds.add(Long.parseLong(id.toString())));
        }
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

        playlist.incrementViewCount();
        playlistRepository.save(playlist);

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
