package com.team8.project2.domain.admin.controller;

import com.team8.project2.domain.admin.dto.StatsResDto;
import com.team8.project2.domain.admin.service.AdminService;
import com.team8.project2.global.dto.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ApiV1ControllerAdmin {

    private final AdminService adminService;

    // ✅ 큐레이션 삭제
    @DeleteMapping("/curations/{curationId}")
    public RsData<String> deleteCuration(@PathVariable Long curationId) {
        adminService.deleteCuration(curationId);
        return RsData.success("큐레이션이 삭제되었습니다.");
    }

    // ✅ 멤버 삭제
    @DeleteMapping("/members/{memberId}")
    public RsData<String> deleteMember(@PathVariable Long memberId) {
        adminService.deleteMember(memberId);
        return RsData.success("멤버가 삭제되었습니다.");
    }

    // ✅ 일정 개수 이상 신고된 큐레이션 조회
    @GetMapping("/reported-curations")
    public RsData<List<Long>> getReportedCurations(@RequestParam(defaultValue = "5") int minReports) {
        return RsData.success("신고된 큐레이션 목록 조회 성공", adminService.getReportedCurations(minReports));
    }

    // ✅ 큐레이션 & 플레이리스트 통계 조회
    @GetMapping("/stats")
    public RsData<StatsResDto> getStats() {
        return RsData.success("트래픽 통계 조회 성공", adminService.getCurationAndPlaylistStats());
    }
}
