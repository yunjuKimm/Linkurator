package com.team8.project2.domain.curation.curation.repository;

import com.team8.project2.domain.curation.curation.entity.CurationTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CurationTagRepository extends JpaRepository<CurationTag, Long> {
    void deleteByCurationId(Long curationId);
}