package com.team8.project2.domain.curation.curation.repository;

import com.team8.project2.domain.curation.curation.entity.CurationLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CurationLinkRepository extends JpaRepository<CurationLink, Long> {
    void deleteByCurationId(Long curationId);
}