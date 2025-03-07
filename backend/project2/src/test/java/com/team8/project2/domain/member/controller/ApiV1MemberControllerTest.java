package com.team8.project2.domain.member.controller;

import com.team8.project2.domain.member.entity.Member;
import com.team8.project2.domain.member.service.MemberService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
public class ApiV1MemberControllerTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private MemberService memberService;

    private ResultActions joinRequest(String memberId, String password, String email, String role, String profileImage, String introduce) throws Exception {
        return mvc
                .perform(
                        post("/api/v1/members/join")
                                .content("""
                                        {
                                            "memberId": "%s",
                                            "password": "%s",
                                            "email": "%s",
                                            "role": "%s",
                                            "profileImage": "%s",
                                            "introduce": "%s"
                                        }
                                        """
                                        .formatted(memberId, password, email, role, profileImage, introduce)
                                        .stripIndent())
                                .contentType(
                                        new MediaType(MediaType.APPLICATION_JSON, StandardCharsets.UTF_8)
                                )
                )
                .andDo(print());
    }

    @Test
    @DisplayName("회원 가입1")
    void join1() throws Exception {

        String memberId = "user123";
        String password = "securePass123";
        String email = "user123@example.com";
        String role = "MEMBER"; // RoleEnum이 문자열로 변환됨
        String profileImage = "https://example.com/profile.jpg";
        String introduce = "안녕하세요! 저는 새로운 회원입니다.";

        ResultActions resultActions = joinRequest(memberId, password,email,role,profileImage,introduce);
        //입력 확인
        Member member = memberService.findByMemberId("user123").get();


        resultActions
                .andExpect(status().isCreated())
                .andExpect(handler().handlerType(ApiV1MemberController.class))
                .andExpect(handler().methodName("join"))
                .andExpect(jsonPath("$.code").value("201-1"))
                .andExpect(jsonPath("$.msg").value("회원 가입이 완료되었습니다."));

        //checkMember(resultActions, member);
    }
}
