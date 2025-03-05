package com.team8.project2.domain.curation.curation.entity;

import com.team8.project2.domain.curation.tag.entity.Tag;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Entity
@Getter
@Setter
public class CurationTag {

    @EmbeddedId
    private CurationTagId id;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "curationId", insertable = false, updatable = false)
    private Curation curation;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @JoinColumn(name = "tagId", insertable = false, updatable = false)
    private Tag tag;

    @EqualsAndHashCode
    @Embeddable
    @Getter
    @Setter
    public static class CurationTagId implements Serializable {

        @Column(name = "curationId")
        private Long curationId;

        @Column(name = "tagId")
        private Long TagId;

        public CurationTagId() {}
    }

    public CurationTag setCurationAndTag(Curation curation, Tag tag) {
        CurationTagId curationTagId = new CurationTagId();
        curationTagId.setCurationId(curation.getId());
        curationTagId.setTagId(tag.getId());
        this.id = curationTagId;
        this.curation = curation;
        this.tag = tag;
        return this;
    }
}
