package com.team8.project2.domain.admin.controller;

import com.team8.project2.domain.admin.dto.StatsResDto;
import com.team8.project2.domain.admin.service.AdminService;
import com.team8.project2.domain.curation.curation.service.CurationService;
import com.team8.project2.domain.member.entity.Member;
import com.team8.project2.global.Rq;
import com.team8.project2.global.dto.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class ApiV1AdminController {

    private final CurationService curationService;
    private final AdminService adminService;
    private final Rq rq;


    // ✅ 큐레이션 삭제
    @DeleteMapping("/curations/{curationId}")
    public RsData<String> deleteCuration(@PathVariable Long curationId) {
        Member member = rq.getActor();

        curationService.deleteCuration(curationId, member);
        return new RsData<>("204-1", "글이 성공적으로 삭제되었습니다.", null);
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
