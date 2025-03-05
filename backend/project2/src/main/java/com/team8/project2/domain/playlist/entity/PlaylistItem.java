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

    @Column(nullable = false) // 🔹 NULL 허용 안 함
    private Long itemId;

    @Column(nullable = false) // 🔹 NULL 허용 안 함
    private String itemType;

    @ManyToOne
    @JoinColumn(name = "playlist_id", nullable = false) // 🔹 NULL 허용 안 함 (반드시 Playlist와 연결)
    private Playlist playlist;

    public enum PlaylistItemType {
        LINK,
        CURATION
    }

}
