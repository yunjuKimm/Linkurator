package com.team8.project2.domain.playlist.repository;

import com.team8.project2.domain.playlist.entity.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 플레이리스트(Playlist) 데이터를 관리하는 레포지토리 인터페이스입니다.
 * 기본적인 CRUD 기능을 제공합니다.
 */
@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
}
