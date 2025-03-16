package com.team8.project2.domain.curation.report.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.team8.project2.domain.curation.report.entity.Report;
import com.team8.project2.domain.curation.report.entity.ReportType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
	boolean existsByCurationIdAndReporterIdAndReportType(Long curationId, Long id, ReportType reportType);

	@Query("SELECT r.curation.id, r.curation.title, r.reportType, COUNT(r) " +
			"FROM Report r " +
			"WHERE r.curation.id IN :curationIds " +
			"GROUP BY r.curation.id, r.curation.title, r.reportType")
	List<Object[]> countReportsWithCurationNamesByCurationIds(@Param("curationIds") List<Long> curationIds);
}
