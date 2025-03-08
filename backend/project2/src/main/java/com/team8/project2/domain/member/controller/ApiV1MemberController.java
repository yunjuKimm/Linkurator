package com.team8.project2.domain.member.controller;

import com.team8.project2.domain.member.dto.MemberReqDTO;
import com.team8.project2.domain.member.dto.MemberResDTO;
import com.team8.project2.domain.member.entity.Member;
import com.team8.project2.domain.member.service.MemberService;
import com.team8.project2.global.Rq;
import com.team8.project2.global.dto.RsData;
import com.team8.project2.global.exception.ServiceException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
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


    @PostMapping("/join")
    public RsData<MemberResDTO> join(@RequestBody @Valid MemberReqDTO body) {
        System.out.println("null Role"+body.getRole().getClass().toString());
        memberService.findByMemberId(body.getMemberId())
                .ifPresent(member -> {
                    throw new ServiceException("409-1","사용중인 아이디");
                });
        //TODO: RoleEnum 초기화 방식 선정
        //TODO: apikey할당 방식 선정
        //join(String username, String password,RoleEnum role, String email, String profileImage)

        Member member = memberService.join(body.toEntity());

        return new RsData<>(
                "201-1",
                "회원 가입이 완료되었습니다.",
                MemberResDTO.fromEntity(member)
        );
    }
    record LoginResBody(MemberResDTO item, String apiKey) {}
    @PostMapping("/login")
    public RsData<LoginResBody> login(@RequestBody @Valid MemberReqDTO reqBody) {
        Member member = memberService.findByMemberId(reqBody.getMemberId()).orElseThrow(
                () -> new ServiceException("401-1", "잘못된 아이디입니다.")
        );

        if(!member.getPassword().equals(reqBody.getPassword())) {
            throw new ServiceException("401-2", "비밀번호가 일치하지 않습니다.");
        }

        return new RsData<>(
                "200-1",
                "%s님 환영합니다.".formatted(member.getMemberId()),
                new LoginResBody(
                        MemberResDTO.fromEntity(member),
                        member.getApiKey()
                )
        );
    }
}
