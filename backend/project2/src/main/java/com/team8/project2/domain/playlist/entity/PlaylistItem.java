package com.team8.project2.domain.playlist.entity;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaylistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long itemId;
    private String itemType;

    @ManyToOne
    @JoinColumn(name = "playlist_id")
    private Playlist playlist;
}
