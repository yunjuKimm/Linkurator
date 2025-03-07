package com.team8.project2.domain.member.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Member {
    @Id // PRIMARY KEY
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AUTO_INCREMENT
    @Setter(AccessLevel.PRIVATE)
    private Long id; // long -> null X, Long -> null O

    @CreatedDate
    @Setter(AccessLevel.PRIVATE)
    private LocalDateTime createdDate;

    @LastModifiedDate
    @Setter(AccessLevel.PRIVATE)
    private LocalDateTime modifiedDate;


    @Column(length = 100, unique = true)
    private String memberId;
    @Column(length = 100, unique = true, nullable = true)
    private String username;
    @Column(nullable = false)
    private String password;
    @Column(nullable = false)
    private String apiKey;

    @Enumerated( EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RoleEnum role = RoleEnum.MEMBER;
    @Column
    private String profileImage;
    @Column
    private String email;
    @Column
    private String introduce;

    public boolean isAdmin() {return this.role == RoleEnum.ADMIN;}
    public boolean isMember() {
        return this.role == RoleEnum.MEMBER;
    }

    @PrePersist
    public void prePersist() {
        if (this.apiKey == null) {
            this.apiKey = UUID.randomUUID().toString();  // 기본값 자동 생성
        }
    }
}
