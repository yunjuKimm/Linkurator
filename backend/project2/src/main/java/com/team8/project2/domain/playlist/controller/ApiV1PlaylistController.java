package com.team8.project2.domain.playlist.controller;

import com.team8.project2.domain.playlist.dto.PlaylistCreateDto;
import com.team8.project2.domain.playlist.dto.PlaylistDto;
import com.team8.project2.domain.playlist.dto.PlaylistUpdateDto;
import com.team8.project2.domain.playlist.entity.PlaylistItem;
import com.team8.project2.domain.playlist.service.PlaylistService;
import com.team8.project2.global.dto.RsData;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 플레이리스트(Playlist) API 컨트롤러 클래스입니다.
 * <p>
 * 플레이리스트 생성, 조회, 수정, 삭제 등의 기능을 제공합니다.
 */
@RestController
@RequestMapping("/api/v1/playlists")
@RequiredArgsConstructor
public class ApiV1PlaylistController {

    private final PlaylistService playlistService;

    /**
     * 플레이리스트를 생성합니다.
     *
     * @param request 플레이리스트 생성 요청 DTO
     * @return 생성된 플레이리스트 정보
     */
    @PostMapping
    public RsData<PlaylistDto> createPlaylist(@Valid @RequestBody PlaylistCreateDto request) {
        PlaylistDto playlist = playlistService.createPlaylist(request);
        return RsData.success("플레이리스트가 생성되었습니다.", playlist);
    }

    /**
     * 특정 플레이리스트를 조회합니다.
     *
     * @param id 조회할 플레이리스트의 ID
     * @return 조회된 플레이리스트 정보
     */
    @GetMapping("/{id}")
    public RsData<PlaylistDto> getPlaylist(@PathVariable Long id) {
        PlaylistDto playlist = playlistService.getPlaylist(id);
        return RsData.success("플레이리스트 조회 성공", playlist);
    }

    /**
     * 모든 플레이리스트를 조회합니다.
     *
     * @return 플레이리스트 목록
     */
    @GetMapping
    public RsData<List<PlaylistDto>> getAllPlaylists() {
        List<PlaylistDto> playlists = playlistService.getAllPlaylists();
        return RsData.success("플레이리스트 목록 조회 성공", playlists);
    }

    /**
     * 플레이리스트를 수정합니다.
     *
     * @param id      수정할 플레이리스트의 ID
     * @param request 수정할 플레이리스트 데이터
     * @return 수정된 플레이리스트 정보
     */
    @PatchMapping("/{id}")
    public RsData<PlaylistDto> updatePlaylist(
            @PathVariable Long id,
            @Valid @RequestBody PlaylistUpdateDto request
    ) {
        PlaylistDto updatedPlaylist = playlistService.updatePlaylist(id, request);
        return RsData.success("플레이리스트가 수정되었습니다.", updatedPlaylist);
    }

    /**
     * 플레이리스트를 삭제합니다.
     *
     * @param id 삭제할 플레이리스트의 ID
     * @return 삭제 결과 (null 반환)
     */
    @DeleteMapping("/{id}")
    public RsData<Void> deletePlaylist(@PathVariable Long id) {
        playlistService.deletePlaylist(id);
        return RsData.success("플레이리스트가 삭제되었습니다.", null);
    }

    /**
     * 플레이리스트에 링크를 추가합니다.
     *
     * @param id      플레이리스트의 ID
     * @param request 링크 ID를 담은 요청
     * @return 업데이트된 플레이리스트 정보
     */
    @PostMapping("/{id}/items/link")
    public RsData<PlaylistDto> addLinkToPlaylist(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> request
    ) {
        Long linkId = Long.parseLong(request.get("linkId"));
        PlaylistDto updatedPlaylist =
                playlistService.addPlaylistItem(id, linkId, PlaylistItem.PlaylistItemType.LINK);
        return RsData.success("플레이리스트에 링크가 추가되었습니다.", updatedPlaylist);
    }

    /**
     * 플레이리스트에 큐레이션을 추가합니다.
     *
     * @param id      플레이리스트의 ID
     * @param request 큐레이션 ID를 담은 요청
     * @return 업데이트된 플레이리스트 정보
     */
    @PostMapping("/{id}/items/curation")
    public RsData<PlaylistDto> addCurationToPlaylist(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> request
    ) {
        Long curationId = Long.parseLong(request.get("curationId"));
        PlaylistDto updatedPlaylist =
                playlistService.addPlaylistItem(id, curationId, PlaylistItem.PlaylistItemType.CURATION);
        return RsData.success("플레이리스트에 큐레이션이 추가되었습니다.", updatedPlaylist);
    }

    /**
     * 플레이리스트 아이템을 삭제합니다.
     *
     * @param id     플레이리스트의 ID
     * @param itemId 삭제할 아이템의 식별자
     * @return 삭제 결과 (null 반환)
     */
    @DeleteMapping("/{id}/items/{itemId}")
    public RsData<Void> deletePlaylistItem(
            @PathVariable("id") Long id,
            @PathVariable("itemId") Long itemId
    ) {
        playlistService.deletePlaylistItem(id, itemId);
        return RsData.success("플레이리스트 아이템이 삭제되었습니다.", null);
    }

    /**
     * 플레이리스트 아이템 순서를 변경합니다.
     *
     * @param id             플레이리스트의 ID
     * @param orderedItemIds 변경된 순서대로 정렬된 아이템 ID 목록
     * @return 순서가 변경된 플레이리스트 정보
     */
    @PatchMapping("/{id}/items/order")
    public RsData<PlaylistDto> updatePlaylistItemOrder(
            @PathVariable("id") Long id,
            @RequestBody List<Long> orderedItemIds
    ) {
        PlaylistDto updatedPlaylist =
                playlistService.updatePlaylistItemOrder(id, orderedItemIds);
        return RsData.success("플레이리스트 아이템 순서가 변경되었습니다.", updatedPlaylist);
    }

    /** ✅ 조회수 증가 API */
    @PostMapping("/{id}/view")
    public RsData<Void> recordPlaylistView(@PathVariable Long id) {
        playlistService.recordPlaylistView(id);
        return RsData.success("조회수가 증가되었습니다.", null);
    }

    /** ✅ 좋아요 증가 API */
    @PostMapping("/{id}/like")
    public RsData<Void> likePlaylist(@PathVariable Long id) {
        playlistService.likePlaylist(id);
        return RsData.success("좋아요가 증가되었습니다.", null);
    }

    /** ✅ 추천 API (정렬 기능 추가) */
    @GetMapping("/{id}/recommendation")
    public RsData<List<PlaylistDto>> getRecommendedPlaylists(
            @PathVariable Long id,
            @RequestParam(value = "sort", defaultValue = "combined") String sortType
    ) {
        List<PlaylistDto> recommended = playlistService.recommendPlaylist(id, sortType);
        return RsData.success("추천 플레이리스트 목록을 조회하였습니다.", recommended);
    }
}
