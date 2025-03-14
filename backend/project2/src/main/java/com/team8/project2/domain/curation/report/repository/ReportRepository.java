package com.team8.project2.domain.curation.report.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.team8.project2.domain.curation.report.entity.Report;

public interface ReportRepository extends JpaRepository<Report, Long> {
}
