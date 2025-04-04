package com.team8.project2.domain.curation.tag.entity;

import com.team8.project2.domain.curation.curation.entity.CurationTag;
import com.team8.project2.domain.playlist.entity.Playlist;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 태그(Tag) 엔티티 클래스입니다.
 * 태그는 큐레이션과 연관되어 특정 주제를 나타낼 수 있습니다.
 */
@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "tags")
public class Tag {

    /**
     * 태그의 고유 ID (자동 생성)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tagId", nullable = false)
    private Long id;

    /**
     * 태그 이름 (중복 불가, 필수값)
     */
    @Column(unique = true, nullable = false)
    private String name;

    /**
     * 태그와 연관된 큐레이션 목록 (1:N 관계)
     */
    @OneToMany(mappedBy = "tag")
    private List<CurationTag> curationTags;

    /**
     * 태그와 연관된 플레이리스트 목록 (N:M 관계)
     */
    @ManyToMany(mappedBy = "tags")
    private Set<Playlist> playlists = new HashSet<>();

}