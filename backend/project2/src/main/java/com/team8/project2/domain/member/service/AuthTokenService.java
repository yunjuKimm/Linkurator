package com.team8.project2.domain.member.service;

import com.team8.project2.domain.member.entity.Member;
import com.team8.project2.standard.util.Ut;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthTokenService {

    @Value("${custom.jwt.secret-key}")
    private String keyString;

    @Value("${custom.jwt.expire-seconds}")
    private int expireSeconds;

    public String genAccessToken(Member member) {
        return Ut.Jwt.createToken(
                keyString,
                expireSeconds,
                Map.of(
                        "id", member.getId(),
                        "memberId", member.getMemberId()
                )
        );
    }

    public Map<String, Object> getPayload(String token) {
        if (!Ut.Jwt.isValidToken(keyString, token)) return null;

        Map<String, Object> payload = Ut.Jwt.getPayload(keyString, token);
        Number idNo = (Number) payload.get("id");
        long id = idNo.longValue();
        String memberId = (String) payload.get("memberId");

        return Map.of(
                "id", id,
                "memberId", memberId
        );
    }
}
