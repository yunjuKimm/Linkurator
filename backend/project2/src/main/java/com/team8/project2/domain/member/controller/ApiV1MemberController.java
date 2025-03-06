package com.team8.project2.domain.member.controller;

import com.team8.project2.domain.member.dto.MemberDto;
import com.team8.project2.domain.member.entity.Member;
import com.team8.project2.domain.member.entity.RoleEnum;
import com.team8.project2.domain.member.service.MemberService;
import com.team8.project2.global.Rq;
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
    private final Rq rq;

    record JoinReqBody(
            @NotBlank @Length(min = 3) String memberId,
            @NotBlank @Length(min = 3) String password,
            @NotBlank @Length(min = 3) String email,
            RoleEnum role,
            String profileImage,
            String introduce
    ) {}

    @PostMapping("/join")
    public RsData<MemberDto> join(@RequestBody @Valid JoinReqBody body) {
        memberService.findByMemberId(body.memberId())
                .ifPresent(member -> {
                    throw new ServiceException("409-1","사용중인 아이디");
                });
        //TODO: RoleEnum 초기화 방식 선정
        //TODO: apikey할당 방식 선정
        //join(String username, String password,RoleEnum role, String email, String profileImage)
        Member member = memberService.join(body.memberId(), body.password(), body.role, body.email(), body.profileImage(), body.introduce());

        return new RsData<>(
                "201-1",
                "회원 가입이 완료되었습니다.",
                new MemberDto(member)
        );
    }
}
