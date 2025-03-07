package com.team8.project2.domain.member.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.team8.project2.domain.member.entity.Member;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class MemberDto {

    private long id;
    @JsonProperty("createdDatetime")
    private LocalDateTime createdDate;
    @JsonProperty("modifiedDatetime")
    private LocalDateTime modifiedDate;

    public MemberDto(Member member) {
        this.id = member.getId();
        this.createdDate = member.getCreatedDate();
        this.modifiedDate = member.getModifiedDate();
    }
}
