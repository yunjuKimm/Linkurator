package com.team8.project2.domain.curation.report.service;

import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.curation.curation.repository.CurationRepository;
import com.team8.project2.domain.curation.report.dto.ReportedCurationsDetailResDto;
import com.team8.project2.domain.curation.report.entity.Report;

import com.team8.project2.domain.curation.report.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final CurationRepository curationRepository;

    @Transactional
    public List<ReportedCurationsDetailResDto> getReportedCurationsDetailResDtos(List<Long> reportedCurationIds) {

        // 1️⃣ 신고된 큐레이션 ID를 기반으로 큐레이션 목록 조회
        List<Curation> curations = curationRepository.findByIdIn(reportedCurationIds);

        // 2️⃣ 신고된 큐레이션 ID를 기반으로 신고(Report) 목록 조회
        List<Report> reports = reportRepository.findByCurationIdIn(reportedCurationIds);

        // 3️⃣ 큐레이션 ID별 신고 목록을 매핑 (Map<Long, List<Report>>)
        Map<Long, List<Report>> reportsByCuration = reports.stream()
                .collect(Collectors.groupingBy(report -> report.getCuration().getId()));

        return curations.stream()
                .map(curation -> new ReportedCurationsDetailResDto(
                        curation,
                        reportsByCuration.getOrDefault(curation.getId(), new ArrayList<>()) // 신고 데이터가 없으면 빈 리스트
                ))
                .collect(Collectors.toList());
    }
}
