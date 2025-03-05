package com.team8.project2.domain.fakemember.entity;

import com.team8.project2.domain.member.entity.RoleEnum;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StubMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username; // 🔹 가짜 사용자 이름 (실제 Member가 구현되면 변경)

    @Enumerated(EnumType.STRING)
    private RoleEnum role; // 🔹 사용자 역할 추가 (ADMIN, USER)

    public StubMember(Long id, String username) {
        this.id = id;
        this.username = username;
        this.role = RoleEnum.USER; // 기본적으로 USER 권한 부여
    }
}
