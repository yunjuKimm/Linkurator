package com.team8.project2.domain.curation.entity;

import com.team8.project2.domain.link.entity.Link;
import jakarta.persistence.*;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
@Entity
@Getter
@Setter
public class CurationLink {

    @EmbeddedId
    private CurationLinkId id;

    @ManyToOne
    @JoinColumn(name = "curationId", insertable = false, updatable = false)
    private Curation curation;

    @ManyToOne
    @JoinColumn(name = "linkId", insertable = false, updatable = false)
    private Link link;

    @EqualsAndHashCode
    @Embeddable
    @Getter
    @Setter
    public static class CurationLinkId implements Serializable {

        @Column(name = "curationId")
        private Long curationId;

        @Column(name = "linkId")
        private Long linkId;

        public CurationLinkId() {}
    }

    public CurationLink setCurationAndLink(Curation curation, Link link) {
        CurationLink.CurationLinkId curationLinkId = new CurationLink.CurationLinkId();
        curationLinkId.setCurationId(curation.getId());
        curationLinkId.setLinkId(link.getId());
        this.id = curationLinkId;
        this.curation = curation;
        this.link = link;
        return this;
    }
}
