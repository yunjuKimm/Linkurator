package com.team8.project2.domain.fakemember.repository;

import com.team8.project2.domain.fakemember.entity.StubMember;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class FakeMemberRepository {

    public Optional<StubMember> findById(Long id) {
        // 🔹 항상 ID 1번 사용자를 반환 (가짜 데이터)
        return Optional.of(new StubMember(id, "StubUser"));
    }
}
