package com.team8.project2.domain.playlist.controller;

import com.team8.project2.domain.playlist.dto.PlaylistCreateDto;
import com.team8.project2.domain.playlist.dto.PlaylistDto;
import com.team8.project2.domain.playlist.dto.PlaylistUpdateDto;
import com.team8.project2.domain.playlist.service.PlaylistService;
import com.team8.project2.global.dto.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/playlists")
@RequiredArgsConstructor
public class ApiV1PlaylistController {

    private final PlaylistService playlistService;

    /** 플레이리스트 생성 */
    @PostMapping
    public ResponseEntity<RsData<PlaylistDto>> createPlaylist(@RequestBody PlaylistCreateDto request) {
        PlaylistDto playlist = playlistService.createPlaylist(request);
        return ResponseEntity.ok(RsData.success("플레이리스트가 생성되었습니다.", playlist));
    }

    /** 특정 플레이리스트 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<RsData<PlaylistDto>> getPlaylist(@PathVariable Long id) {
        PlaylistDto playlist = playlistService.getPlaylist(id);
        return ResponseEntity.ok(RsData.success("플레이리스트 조회 성공", playlist));
    }

    /** 모든 플레이리스트 조회 */
    @GetMapping
    public ResponseEntity<RsData<List<PlaylistDto>>> getAllPlaylists() {
        List<PlaylistDto> playlists = playlistService.getAllPlaylists();
        return ResponseEntity.ok(RsData.success("플레이리스트 목록 조회 성공", playlists));
    }

    /** 플레이리스트 수정 */
    @PutMapping("/{id}")
    public ResponseEntity<RsData<PlaylistDto>> updatePlaylist(@PathVariable Long id, @RequestBody PlaylistUpdateDto request) {
        PlaylistDto updatedPlaylist = playlistService.updatePlaylist(id, request);
        return ResponseEntity.ok(RsData.success("플레이리스트가 수정되었습니다.", updatedPlaylist));
    }

    /** 플레이리스트 삭제 */
    @DeleteMapping("/{id}")
    public ResponseEntity<RsData<Void>> deletePlaylist(@PathVariable Long id) {
        playlistService.deletePlaylist(id);
        return ResponseEntity.ok(RsData.success("플레이리스트가 삭제되었습니다.", null));
    }
}