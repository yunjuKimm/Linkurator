package com.team8.project2.domain.curation.curation.repository;

import com.team8.project2.domain.curation.curation.entity.Curation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CurationRepository extends JpaRepository<Curation, Long> {
    @Query("SELECT DISTINCT c FROM Curation c " +
            "JOIN c.tags ct " +
            "WHERE ct.tag.name IN :tags")
    List<Curation> findByTags(@Param("tags") List<String> tags);
}
