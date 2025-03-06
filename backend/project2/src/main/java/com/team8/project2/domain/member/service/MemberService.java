package com.team8.project2.domain.member.service;

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
    public Member join(String userId, String username, String password,RoleEnum role, String email, String imgUrl) {
        return join(userId, username, password, role, email, imgUrl, null);
    }

    @Transactional
    public Member join(String userId, String username, String password, RoleEnum role, String email, String imgUrl, String description) {

        //TODO: apikey 할당방식 지정
        //TODO: RoleEnum 확인 이후 주입 로직 필요
        Member member = Member.builder()
                .userId(userId)
                .username(username)
                .apiKey(username)
                .password(password)
                .imgUrl(imgUrl)
                .email(email)
                .description(description).build();
        return memberRepository.save(member);
    }
    public Optional<Member> findByApiKey(String apiKey) { return memberRepository.findByApiKey(apiKey);}

    public Optional<Member> findByUserId(String userId) {
        return memberRepository.findByUserId(userId);
    }
}
