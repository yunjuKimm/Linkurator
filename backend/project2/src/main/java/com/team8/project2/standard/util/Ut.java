package com.team8.project2.standard.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;

public class Ut {
    public static class Json {
        private static final ObjectMapper objectMapper = new ObjectMapper();

        public static String toString(Object obj) {
            try {
                return objectMapper.writeValueAsString(obj);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        }
    }

    public static class Jwt {
        public static String createToken(String keyString, int expireSeconds, Map<String, Object> claims) {
            SecretKey secretKey = Keys.hmacShaKeyFor(keyString.getBytes());

            Date issuedAt = new Date();
            Date expiration = new Date(issuedAt.getTime() + 1000L * expireSeconds);

            return Jwts.builder()
                    .claims(claims)
                    .issuedAt(issuedAt)
                    .expiration(expiration)
                    .signWith(secretKey)
                    .compact();
        }

        public static boolean isValidToken(String keyString, String token) {
            try {
                SecretKey secretKey = Keys.hmacShaKeyFor(keyString.getBytes());

                Jwts.parser()
                        .verifyWith(secretKey)
                        .build()
                        .parse(token);

                return true; // 토큰이 정상적으로 검증되면 true 반환
            } catch (ExpiredJwtException e) {
                System.out.println("⚠️ [JWT] 토큰 만료됨: " + e.getMessage());
            } catch (SignatureException e) {
                System.out.println("🚨 [JWT] 서명 불일치: " + e.getMessage());
            } catch (MalformedJwtException e) {
                System.out.println("🚨 [JWT] 형식 오류: " + e.getMessage());
            } catch (Exception e) {
                System.out.println("❌ [JWT] 기타 오류: " + e.getMessage());
            }
            return false;
        }

        public static Map<String, Object> getPayload(String keyString, String jwtStr) {
            SecretKey secretKey = Keys.hmacShaKeyFor(keyString.getBytes());

            return (Map<String, Object>) Jwts
                    .parser()
                    .verifyWith(secretKey)
                    .build()
                    .parse(jwtStr)
                    .getPayload();
        }
    }
}
