package com.team8.project2.domain.curation.like.repository;

import com.team8.project2.domain.curation.like.entity.Like;
import com.team8.project2.domain.curation.like.entity.Like.LikeId;
import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, LikeId> {
    Optional<Like> findByCurationAndMember(Curation curation, Member member);
}
