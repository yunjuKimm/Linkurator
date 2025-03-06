package com.team8.project2.domain.playlist.service;

import com.team8.project2.domain.playlist.dto.PlaylistCreateDto;
import com.team8.project2.domain.playlist.dto.PlaylistDto;
import com.team8.project2.domain.playlist.dto.PlaylistUpdateDto;
import com.team8.project2.domain.playlist.entity.Playlist;
import com.team8.project2.domain.playlist.entity.PlaylistItem;
import com.team8.project2.domain.playlist.repository.PlaylistRepository;
import com.team8.project2.global.exception.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;
import java.util.List;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlaylistServiceTest {

    @InjectMocks
    private PlaylistService playlistService;

    @Mock
    private PlaylistRepository playlistRepository;

    private Playlist samplePlaylist;

    @BeforeEach
    void setUp() {
        samplePlaylist = Playlist.builder()
                .id(1L)
                .title("테스트 플레이리스트")
                .description("테스트 설명")
                .build();
    }

    @Test
    @DisplayName("플레이리스트를 정상적으로 생성해야 한다.")
    void shouldCreatePlaylistSuccessfully() {
        // Given
        PlaylistCreateDto request = new PlaylistCreateDto();
        request.setTitle("새 플레이리스트");
        request.setDescription("새로운 설명");

        Playlist newPlaylist = Playlist.builder()
                .id(2L)
                .title(request.getTitle())
                .description(request.getDescription())
                .build();

        when(playlistRepository.save(any(Playlist.class))).thenReturn(newPlaylist);

        // When
        PlaylistDto createdPlaylist = playlistService.createPlaylist(request);

        // Then
        assertNotNull(createdPlaylist);
        assertEquals(request.getTitle(), createdPlaylist.getTitle());
        assertEquals(request.getDescription(), createdPlaylist.getDescription());
    }

    @Test
    @DisplayName("플레이리스트를 정상적으로 조회해야 한다.")
    void shouldRetrievePlaylistSuccessfully() {
        // Given
        when(playlistRepository.findById(1L)).thenReturn(Optional.of(samplePlaylist));

        // When
        PlaylistDto foundPlaylist = playlistService.getPlaylist(1L);

        // Then
        assertNotNull(foundPlaylist);
        assertEquals(samplePlaylist.getTitle(), foundPlaylist.getTitle());
        assertEquals(samplePlaylist.getDescription(), foundPlaylist.getDescription());
    }

    @Test
    @DisplayName("존재하지 않는 플레이리스트 조회 시 NotFoundException이 발생해야 한다.")
    void shouldThrowNotFoundExceptionWhenPlaylistDoesNotExist() {
        // Given
        when(playlistRepository.findById(99L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NotFoundException.class, () -> playlistService.getPlaylist(99L));
    }

    @Test
    @DisplayName("모든 플레이리스트를 정상적으로 조회해야 한다.")
    void shouldRetrieveAllPlaylistsSuccessfully() {
        // Given
        List<Playlist> playlists = Arrays.asList(samplePlaylist);
        when(playlistRepository.findAll()).thenReturn(playlists);

        // When
        List<PlaylistDto> foundPlaylists = playlistService.getAllPlaylists();

        // Then
        assertFalse(foundPlaylists.isEmpty());
        assertEquals(1, foundPlaylists.size());
    }

    @Test
    @DisplayName("플레이리스트를 정상적으로 수정해야 한다.")
    void shouldUpdatePlaylistSuccessfully() {
        // Given
        PlaylistUpdateDto request = new PlaylistUpdateDto();
        request.setTitle("수정된 플레이리스트");
        request.setDescription("수정된 설명");

        when(playlistRepository.findById(1L)).thenReturn(Optional.of(samplePlaylist));
        when(playlistRepository.save(any(Playlist.class))).thenReturn(samplePlaylist);

        // When
        PlaylistDto updatedPlaylist = playlistService.updatePlaylist(1L, request);

        // Then
        assertNotNull(updatedPlaylist);
        assertEquals(request.getTitle(), updatedPlaylist.getTitle());
        assertEquals(request.getDescription(), updatedPlaylist.getDescription());
    }

    @Test
    @DisplayName("플레이리스트를 정상적으로 삭제해야 한다.")
    void shouldDeletePlaylistSuccessfully() {
        // Given
        when(playlistRepository.existsById(1L)).thenReturn(true);
        doNothing().when(playlistRepository).deleteById(1L);

        // When & Then
        assertDoesNotThrow(() -> playlistService.deletePlaylist(1L));
    }

    @Test
    @DisplayName("존재하지 않는 플레이리스트 삭제 시 NotFoundException이 발생해야 한다.")
    void shouldThrowNotFoundExceptionWhenDeletingNonExistingPlaylist() {
        // Given
        when(playlistRepository.existsById(99L)).thenReturn(false);

        // When & Then
        assertThrows(NotFoundException.class, () -> playlistService.deletePlaylist(99L));
    }

    @Test
    @DisplayName("플레이리스트에 아이템을 추가할 수 있다.")
    void addPlaylistItem() {
        // Given
        Long newItemId = 100L;

        when(playlistRepository.findById(1L)).thenReturn(Optional.of(samplePlaylist));
        when(playlistRepository.save(any(Playlist.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        PlaylistDto updatedPlaylist = playlistService.addPlaylistItem(1L, newItemId, PlaylistItem.PlaylistItemType.LINK);

        // Then
        assertNotNull(updatedPlaylist);
        assertEquals("테스트 플레이리스트", updatedPlaylist.getTitle());
        assertFalse(updatedPlaylist.getItems().isEmpty());
        assertEquals(newItemId, updatedPlaylist.getItems().get(0).getItemId());
        assertEquals("LINK", updatedPlaylist.getItems().get(0).getItemType());
    }

    @Test
    @DisplayName("실패 - 존재하지 않는 플레이리스트에 아이템을 추가할 수 없다.")
    void addPlaylistItemNotFound() {
        // Given
        Long newItemId = 100L;
        when(playlistRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(NotFoundException.class, () ->
                playlistService.addPlaylistItem(1L, newItemId, PlaylistItem.PlaylistItemType.LINK));
    }

    @Test
    @DisplayName("플레이리스트에서 아이템을 삭제할 수 있다.")
    void deletePlaylistItem_success() {
        // Given
        Long itemIdToDelete = 100L;

        PlaylistItem item1 = PlaylistItem.builder()
                .itemId(100L)
                .itemType(PlaylistItem.PlaylistItemType.LINK)
                .build();
        PlaylistItem item2 = PlaylistItem.builder()
                .itemId(101L)
                .itemType(PlaylistItem.PlaylistItemType.CURATION)
                .build();

        samplePlaylist.setItems(new ArrayList<>(Arrays.asList(item1, item2)));

        when(playlistRepository.findById(samplePlaylist.getId())).thenReturn(Optional.of(samplePlaylist));

        // When
        playlistService.deletePlaylistItem(samplePlaylist.getId(), itemIdToDelete);

        // Then
        assertFalse(samplePlaylist.getItems().stream()
                .anyMatch(item -> item.getItemId().equals(itemIdToDelete)));
        verify(playlistRepository, times(1)).save(samplePlaylist);
    }


    @Test
    @DisplayName("실패 - 존재하지 않는 아이템은 삭제할 수 없다.")
    void deletePlaylistItem_itemNotFound() {
        // Given
        Long itemIdToDelete = 100L;
        samplePlaylist.setItems(new ArrayList<>());

        when(playlistRepository.findById(samplePlaylist.getId()))
                .thenReturn(Optional.of(samplePlaylist));

        // When & Then
        assertThrows(NotFoundException.class, () -> {
            playlistService.deletePlaylistItem(samplePlaylist.getId(), itemIdToDelete);
        });
    }

}
