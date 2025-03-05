package com.team8.project2.domain.playlist.entity;

import com.team8.project2.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Playlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title; // 플레이리스트 제목

    @Column(nullable = false)
    private String description; // 플레이리스트 설명

    @Column(nullable = false)
    private boolean isPublic = true; // 🔹 공개 여부 (기본값: 공개)

    @OneToMany(mappedBy = "playlist", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PlaylistItem> items = new ArrayList<>();

    /**
     * 🔹 플레이리스트 수정 메서드
     */
    public void updatePlaylist(String title, String description, Boolean isPublic) {
        if (title != null) this.title = title;
        if (description != null) this.description = description;
        if (isPublic != null) this.isPublic = isPublic;
    }
}
