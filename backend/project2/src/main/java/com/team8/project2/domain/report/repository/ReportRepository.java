package com.team8.project2.domain.report.repository;

import com.team8.project2.domain.report.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    /**
     * 특정 큐레이션이 받은 신고 개수를 반환하는 메서드
     *
     * @param curationId 큐레이션 ID
     * @return 해당 큐레이션의 신고 개수
     */
    @Query("SELECT COUNT(r) FROM Report r WHERE r.curation.id = :curationId")
    long countReportsByCurationId(Long curationId);
}
