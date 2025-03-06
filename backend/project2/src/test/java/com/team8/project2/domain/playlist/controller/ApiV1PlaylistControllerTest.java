package com.team8.project2.domain.playlist.controller;

import com.team8.project2.domain.playlist.dto.PlaylistCreateDto;
import com.team8.project2.domain.playlist.dto.PlaylistDto;
import com.team8.project2.domain.playlist.entity.PlaylistItem;
import com.team8.project2.domain.playlist.service.PlaylistService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ApiV1PlaylistControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private ApiV1PlaylistController playlistController;

    @Mock
    private PlaylistService playlistService;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(playlistController).build(); // 🔹 여기서 초기화!
    }

    @Test
    @DisplayName("플레이리스트를 정상적으로 생성해야 한다.")
    void shouldCreatePlaylistSuccessfully() throws Exception {
        // Given
        PlaylistCreateDto request = new PlaylistCreateDto();
        request.setTitle("New Playlist");
        request.setDescription("Description");

        PlaylistDto response = PlaylistDto.builder()
                .id(1L)
                .title(request.getTitle())
                .description(request.getDescription())
                .build();

        when(playlistService.createPlaylist(any(PlaylistCreateDto.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/v1/playlists")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value("New Playlist"));
    }

    @Test
    @DisplayName("플레이리스트에 링크 추가가 정상적으로 이루어져야 한다.")
    void addLinkToPlaylist() throws Exception {
        Long playlistId = 1L;
        String linkIdStr = "100";
        Map<String, String> request = new HashMap<>();
        request.put("linkId", linkIdStr);

        PlaylistDto sampleDto = PlaylistDto.builder()
                .id(playlistId)
                .title("테스트 플레이리스트")
                .description("테스트 설명")
                .build();

        when(playlistService.addPlaylistItem(eq(playlistId), anyLong(), eq(PlaylistItem.PlaylistItemType.LINK)))
                .thenReturn(sampleDto);

        mockMvc.perform(post("/api/v1/playlists/{id}/items/link", playlistId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(playlistId))
                .andExpect(jsonPath("$.data.title").value("테스트 플레이리스트"));
    }

    @Test
    @DisplayName("플레이리스트에서 아이템이 삭제되어야 한다.")
    void deletePlaylistItem() throws Exception {
        Long playlistId = 1L;
        Long itemId = 100L;

        mockMvc.perform(delete("/api/v1/playlists/{id}/items/{itemId}", playlistId, itemId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.msg").value("플레이리스트 아이템이 삭제되었습니다."));

        verify(playlistService, times(1)).deletePlaylistItem(playlistId, itemId);
    }


    @Test
    @DisplayName("플레이리스트에서 아이템 순서가 변경되어야 한다.")
    void updatePlaylistItemOrder() throws Exception {
        PlaylistDto updatedDto = PlaylistDto.builder()
                .id(1L)
                .title("테스트 플레이리스트")
                .description("테스트 설명")
                .build();

        List<Long> newOrder = Arrays.asList(3L, 1L, 2L);

        when(playlistService.updatePlaylistItemOrder(1L, newOrder)).thenReturn(updatedDto);

        mockMvc.perform(patch("/api/v1/playlists/1/items/order")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[3, 1, 2]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.msg").value("플레이리스트 아이템 순서가 변경되었습니다."))
                .andExpect(jsonPath("$.data.id").value(1L))
                .andExpect(jsonPath("$.data.title").value("테스트 플레이리스트"));
    }

}
