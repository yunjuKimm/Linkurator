package com.team8.project2.global.init;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.curation.curation.repository.CurationRepository;
import com.team8.project2.domain.member.entity.Member;
import com.team8.project2.domain.member.entity.RoleEnum;
import com.team8.project2.domain.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class BaseInitData {

	private final MemberRepository memberRepository;

	@Bean
	public ApplicationRunner init(CurationRepository curationRepository) {
		return args -> {
			if (memberRepository.count() == 0 && curationRepository.count() == 0) {
				Member member = Member.builder()
					.email("team8@gmail.com")
					.role(RoleEnum.MEMBER)
					.userId("userid")
					.username("username")
					.password("password")
					.imgUrl("imgurl")
					.description("test")
					.build();
				memberRepository.save(member);

				Curation curation = Curation.builder()
					.title("test")
					.content("test")
					.member(member)
					.build();
				curationRepository.save(curation);
			}
		};
	}

}
