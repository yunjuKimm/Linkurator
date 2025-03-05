package com.team8.project2.domain.curation.like.entity;

import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.member.entity.Member;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Entity
@Getter
@Setter
public class Like {

    @EmbeddedId
    private LikeId id;

    @ManyToOne
    @JoinColumn(name = "curationId", insertable=false, updatable=false)
    private Curation curation;

    @ManyToOne
    @JoinColumn(name = "memberId", insertable=false, updatable=false)
    private Member member;

    @EqualsAndHashCode
    @Embeddable
    @Getter
    @Setter
    public static class LikeId implements Serializable {

        @Column(name = "curationId")
        private Long curationId;

        @Column(name = "memberId")
        private Long memberId;

        public LikeId() {}
    }

    public Like setLike(Curation curation, Member member) {
        LikeId likeId = new LikeId();
        likeId.setCurationId(curation.getId());
        likeId.setMemberId(member.getId());
        this.id = likeId;
        this.curation = curation;
        this.member = member;
        return this;
    }
}
