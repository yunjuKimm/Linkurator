package com.team8.project2.domain.admin.dto;

import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.curation.report.entity.Report;
import com.team8.project2.domain.curation.report.entity.ReportType;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public class ReportedCurationsDetailResDto {
    private Long id;

    /** 큐레이션 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curationId")
    private Curation curation;

    /** 큐레이션 작성자 */
    private String authorName;

    /** 신고 유형과 수 */
    private List<ReportCountResDto> reportTypeCounts;

    @Getter
    @Setter
    public static class ReportCountResDto {
        /** 신고 유형 */
        ReportType reportType;

        /** 신고 수*/
        Long count;

        public ReportCountResDto(ReportType reportType, Long count) {
            this.reportType = reportType;
            this.count = count;
        }
    }

    public ReportedCurationsDetailResDto(Curation curation, List<Report> reports) {
        this.id = curation.getId();
        this.curation = curation;
        this.authorName = curation.getMemberName();

        // 🚀 신고 유형별 개수 계산
        this.reportTypeCounts = reports.stream()
                .collect(Collectors.groupingBy(Report::getReportType, Collectors.counting())) // 유형별 개수 집계
                .entrySet().stream()
                .map(entry -> new ReportCountResDto(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }
}
