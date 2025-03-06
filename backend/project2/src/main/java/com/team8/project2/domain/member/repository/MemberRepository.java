package com.team8.project2.domain.member.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.team8.project2.domain.member.entity.Member;

public interface MemberRepository extends JpaRepository<Member, Long> {
}
