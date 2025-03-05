package com.team8.project2.domain.playlist.entity;

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

    @Column(nullable = false) // 🔹 NULL 허용 안 함
    private String title;

    @Column(nullable = false) // 🔹 NULL 허용 안 함
    private String description;

    @OneToMany(mappedBy = "playlist", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PlaylistItem> items = new ArrayList<>(); // 🔹 NULL 방지 (빈 리스트로 초기화)
}
