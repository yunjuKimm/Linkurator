package com.team8.project2.domain.curation.curation.repository;

import com.team8.project2.domain.curation.curation.entity.Curation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CurationRepository extends JpaRepository<Curation, Long> {

    @Query("SELECT c FROM Curation c " +
            "LEFT JOIN c.tags ct " +
            "LEFT JOIN ct.tag t " +
            "WHERE (:title IS NULL OR c.title LIKE %:title%) " +
            "AND (:content IS NULL OR c.content LIKE %:content%) " +
            "AND (:tags IS NULL OR t.name IN :tags) ")
//            +
//            "ORDER BY " +
//            "CASE WHEN :searchOrder = 'LATEST' THEN c.createdAt END DESC, " +
//            "CASE WHEN :searchOrder = 'OLDEST' THEN c.createdAt END ASC, " +
//            "CASE WHEN :searchOrder = 'LIKE' THEN c.like END DESC")
    List<Curation> searchByFilters(@Param("tags") List<String> tags,
                                   @Param("title") String title,
                                   @Param("content") String content);
//                                   ,@Param("searchOrder") SearchOrder searchOrder);
}
