package com.team8.project2.domain.playlist.entity;

import com.team8.project2.domain.curation.curation.entity.CurationTag;
import com.team8.project2.domain.curation.tag.entity.Tag;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 플레이리스트(Playlist) 엔티티 클래스입니다.
 * 사용자가 생성한 플레이리스트 정보를 저장합니다.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Playlist {

    /**
     * 플레이리스트의 고유 ID (자동 생성)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 플레이리스트 제목 (필수값)
     */
    @Column(nullable = false)
    private String title;

    /**
     * 플레이리스트 설명 (필수값)
     */
    @Column(nullable = false)
    private String description;

    /**
     * 플레이리스트 공개 여부 (기본값: 공개)
     */
    @Column(nullable = false)
    private boolean isPublic = true;

    /**
     * 플레이리스트에 포함된 항목 목록 (1:N 관계)
     */
    @OneToMany(mappedBy = "playlist", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PlaylistItem> items = new ArrayList<>();

    /**
     * 플레이리스트 정보를 수정하는 메서드
     * @param title 변경할 제목 (null일 경우 변경 없음)
     * @param description 변경할 설명 (null일 경우 변경 없음)
     * @param isPublic 변경할 공개 여부 (null일 경우 변경 없음)
     */
    public void updatePlaylist(String title, String description, Boolean isPublic) {
        if (title != null) this.title = title;
        if (description != null) this.description = description;
        if (isPublic != null) this.isPublic = isPublic;
    }


    /**
     * 플레이리스트 연관 추천 태그
     */
    @ManyToMany
    @JoinTable(
            name="PlaylistTag",
            joinColumns = @JoinColumn(name="playlist_id"),
            inverseJoinColumns = @JoinColumn(name="tag_id")
    )

    @ElementCollection
    private Set<Tag> tags = new HashSet<>();

    public Set<String> getTags() {
        return this.items.stream()
                .filter(item -> item.getCuration() != null) // ✅ Curation이 존재하는 경우만 처리
                .flatMap(item -> item.getCuration().getTags().stream().map(curationTag -> curationTag.getTag().getName())) // ✅ `Tag`의 이름 가져오기
                .collect(Collectors.toSet());
    }


}