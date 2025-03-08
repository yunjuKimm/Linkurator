package com.team8.project2.domain.member.service;

import com.team8.project2.domain.curation.curation.repository.CurationRepository;
import com.team8.project2.domain.member.entity.Member;
import com.team8.project2.domain.member.entity.RoleEnum;
import com.team8.project2.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final CurationRepository curationRepository;

    public Member join(String memberId, String password, RoleEnum role, String email, String profileImage) {
        return join(memberId, password, role, email, profileImage, null);
    }

    @Transactional
    public Member join(String memberId, String password, RoleEnum role, String email, String profileImage, String introduce) {

        //TODO: apikey 할당방식 지정
        //TODO: RoleEnum 확인 이후 주입 로직 필요
        if(role==null){
            role=RoleEnum.MEMBER;
        }
        Member member = Member.builder()
                .memberId(memberId)
                .apiKey(memberId)
                .password(password)
                .profileImage(profileImage)
                .email(email)
                .introduce(introduce).build();
        return memberRepository.save(member);
    }

    @Transactional
    public Member join(Member member) {
        return memberRepository.save(member);
    }

    public Optional<Member> findByApiKey(String apiKey) { return memberRepository.findByApiKey(apiKey);}

    public Optional<Member> findByMemberId(String memberId) {
        return memberRepository.findByMemberId(memberId);
    }

    @Transactional
    public void deleteMember(Long memberId) {
        // 1. 연관된 Curation 데이터 삭제
        //TODO: curation에 memberID로 인한 삭제 필요
        //curationRepository.deleteByMemberId(memberId);
        // 2. Member 삭제
        memberRepository.deleteById(memberId);
    }
}
