package com.team8.project2.domain.playlist.controller;

import com.team8.project2.domain.playlist.dto.PlaylistCreateDto;
import com.team8.project2.domain.playlist.dto.PlaylistDto;
import com.team8.project2.domain.playlist.service.PlaylistService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ApiV1PlaylistControllerTest {

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private ApiV1PlaylistController playlistController;

    @Mock
    private PlaylistService playlistService;

    ApiV1PlaylistControllerTest() {
        this.mockMvc = MockMvcBuilders.standaloneSetup(playlistController).build();
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
}
