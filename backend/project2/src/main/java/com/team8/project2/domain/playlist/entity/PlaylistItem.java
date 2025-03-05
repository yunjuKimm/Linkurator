package com.team8.project2.domain.playlist.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * 플레이리스트 항목(PlaylistItem) 엔티티 클래스입니다.
 * 플레이리스트에 포함된 개별 항목을 저장합니다.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaylistItem {

    /**
     * 플레이리스트 항목의 고유 ID (자동 생성)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 항목의 고유 ID (예: 음악, 영상 등)
     */
    @Column(nullable = false) // NULL 허용 안 함
    private Long itemId;

    /**
     * 항목의 유형 (예: 음악, 영상 등)
     */
    @Column(nullable = false) // NULL 허용 안 함
    @Enumerated(EnumType.STRING)
    private PlaylistItemType itemType;

    /**
     * 해당 항목이 속한 플레이리스트 (N:1 관계)
     */
    @ManyToOne
    @JoinColumn(name = "playlist_id", nullable = false) // NULL 허용 안 함 (반드시 Playlist와 연결)
    private Playlist playlist;

    public enum PlaylistItemType {
        LINK,
        CURATION
    }

}
