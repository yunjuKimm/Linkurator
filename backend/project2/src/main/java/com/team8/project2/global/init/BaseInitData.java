package com.team8.project2.global.init;

import java.util.List;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import com.team8.project2.domain.comment.dto.CommentDto;
import com.team8.project2.domain.comment.service.CommentService;
import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.curation.curation.repository.CurationRepository;
import com.team8.project2.domain.curation.curation.service.CurationService;
import com.team8.project2.domain.member.entity.Follow;
import com.team8.project2.domain.member.entity.Member;
import com.team8.project2.domain.member.entity.RoleEnum;
import com.team8.project2.domain.member.repository.FollowRepository;
import com.team8.project2.domain.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class BaseInitData {

	private final MemberRepository memberRepository;
	private final CurationRepository curationRepository;
	private final CurationService curationService;

	@Transactional
	@Bean
	public ApplicationRunner init(CommentService commentService, FollowRepository followRepository) {
		return args -> {
			if (memberRepository.count() == 0 && curationRepository.count() == 0) {
				Member member = Member.builder()
					.email("team8@gmail.com")
					.role(RoleEnum.MEMBER)
					.memberId("memberId")
					.username("username")
					.password("password")
					.profileImage("http://localhost:8080/images/team8-logo.png")
					.introduce("test")
					.build();
				memberRepository.save(member);

				Member member2 = Member.builder()
					.email("team9@gmail.com")
					.role(RoleEnum.MEMBER)
					.memberId("othermember")
					.username("other")
					.password("password")
					.profileImage("http://localhost:8080/images/team9-logo.png")
					.introduce("test2")
					.build();
				memberRepository.save(member2);

				Member member3 = Member.builder()
					.email("team10@gmail.com")
					.role(RoleEnum.MEMBER)
					.memberId("othermember2")
					.username("other2")
					.password("password")
					.profileImage("http://localhost:8080/images/team10-logo.png")
					.introduce("test3")
					.build();
				memberRepository.save(member3);

				// member3가 member를 follow
				Follow follow = new Follow();
				follow.setFollowerAndFollowee(member3, member);
				followRepository.save(follow);

				// member3가 member2를 follow
				Follow follow2 = new Follow();
				follow2.setFollowerAndFollowee(member3, member2);
				followRepository.save(follow2);

				Curation curation = curationService.createCuration(
					"curation test title",
					"curation test content",
					List.of("https://www.naver.com/", "https://www.github.com/"),
					List.of("포털", "개발")
				);

				commentService.createComment(
					member,
					curation.getId(),
					CommentDto.builder()
						.content("comment test content")
						.build()
				);
			}
		};
	}
}
