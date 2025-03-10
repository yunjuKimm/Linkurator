package com.team8.project2.global.init;

import com.team8.project2.domain.comment.dto.CommentDto;
import com.team8.project2.domain.comment.service.CommentService;
import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.curation.curation.repository.CurationRepository;
import com.team8.project2.domain.curation.curation.service.CurationService;
import com.team8.project2.domain.member.entity.Member;
import com.team8.project2.domain.member.entity.RoleEnum;
import com.team8.project2.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class BaseInitData {

	private final MemberRepository memberRepository;
	private final CurationRepository curationRepository;
	private final CurationService curationService;

	@Transactional
	@Bean
	public ApplicationRunner init(CommentService commentService) {
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

				Curation curation = curationService.createCuration(
					"curation test title",
					"curation test content",
					List.of("https://www.naver.com/", "https://www.github.com/"),
					List.of("포털", "개발"),
					member
				);

				commentService.createComment(
					curation.getId(),
					CommentDto.builder()
						.content("comment test content")
						.build()
				);
			}
		};
	}
}
