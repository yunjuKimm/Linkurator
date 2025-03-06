package com.team8.project2.global.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // CSRF 보호 비활성화 (테스트용)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/h2-console/**")
                        .permitAll()
                        .requestMatchers("/api/v1/members/join").permitAll() // ✅ 회원가입 API는 인증 없이 허용
                        .anyRequest().authenticated() // 나머지 요청은 인증 필요
                )
                .formLogin(login -> login.disable()) // 폼 로그인 비활성화
                .httpBasic(basic -> basic.disable()); // 기본 인증 비활성화 (JWT 사용 시 필요)

        return http.build();
    }
}
