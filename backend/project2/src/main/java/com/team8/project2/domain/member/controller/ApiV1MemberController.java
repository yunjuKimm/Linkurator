package com.team8.project2.domain.member.controller;

import com.team8.project2.domain.member.dto.MemberDto;
import com.team8.project2.domain.member.entity.Member;
import com.team8.project2.domain.member.entity.RoleEnum;
import com.team8.project2.domain.member.service.MemberService;
import com.team8.project2.global.dto.RsData;
import com.team8.project2.global.exception.ServiceException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.hibernate.validator.constraints.Length;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class ApiV1MemberController {

    private final MemberService memberService;

    public record JoinReqBody(
            @NotBlank @Length(min = 3) String userId,
            @NotBlank @Length(min = 3) String username,
            @NotBlank @Length(min = 3) String password,
            @NotBlank @Length(min = 3) String email,
            RoleEnum role,
            String imgUrl,
            String description
    ) {}

    @PostMapping("/join")
    public RsData<MemberDto> join(@RequestBody @Valid JoinReqBody body) {
        System.out.println("1");
        System.out.println(body);
        memberService.findByUserId(body.userId())
                .ifPresent(member -> {
                    throw new ServiceException("400","잘못된 아이디");
                });
        //TODO: RoleEnum 초기화 방식 선정
        //TODO: apikey할당 방식 선정
        Member member = memberService.join(body.userId, body.username, body.password, body.role, body.email, body.imgUrl);

        return new RsData<>(
                "201-1",
                "회원 가입이 완료되었습니다.",
                new MemberDto(member)
        );
    }
}
