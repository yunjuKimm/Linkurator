package com.team8.project2.domain.admin.service;

import com.team8.project2.domain.admin.dto.ReportedCurationsDetailResDto;
import com.team8.project2.domain.admin.dto.StatsResDto;
import com.team8.project2.domain.comment.entity.Comment;
import com.team8.project2.domain.comment.repository.CommentRepository;
import com.team8.project2.domain.comment.service.CommentService;
import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.curation.curation.repository.CurationRepository;
import com.team8.project2.domain.curation.curation.service.CurationService;
import com.team8.project2.domain.curation.report.entity.Report;
import com.team8.project2.domain.curation.report.entity.ReportType;
import com.team8.project2.domain.curation.report.repository.ReportRepository;
import com.team8.project2.domain.member.entity.Follow;
import com.team8.project2.domain.member.entity.Member;
import com.team8.project2.domain.member.repository.FollowRepository;
import com.team8.project2.domain.member.repository.MemberRepository;
import com.team8.project2.domain.member.service.MemberService;
import com.team8.project2.domain.playlist.repository.PlaylistRepository;
import com.team8.project2.global.exception.NotFoundException;
import com.team8.project2.global.exception.ServiceException;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final CurationRepository curationRepository;
    private final MemberRepository memberRepository;
    private final PlaylistRepository playlistRepository;
    private final MemberService memberService;
    private final CurationService curationService;
    private final EntityManager entityManager;
    private final CommentService commentService;
    private final FollowRepository followRepository;
    private final CommentRepository commentRepository;
    private final ReportRepository reportRepository;

    @Transactional(noRollbackFor = ServiceException.class)
    public void deleteMember(Member member) {
        commentRepository.deleteByAuthor(member);
        curationRepository.deleteByMember(member);
        followRepository.deleteByFollowerOrFollowee(member,member);

        memberService.deleteMember(member.getMemberId());
    }

    public void deleteMemberById(Long Id){
        if (!memberRepository.existsById(Id)) {
            throw new NotFoundException("멤버를 찾을 수 없습니다.");
        }


        memberRepository.deleteById(Id);
    };

    // ✅ 관리자용 큐레이션 삭제
    @Transactional
    public void deleteCuration(Long curationId) {
        if (!curationRepository.existsById(curationId)) {
            throw new NotFoundException("큐레이션을 찾을 수 없습니다.");
        }
        curationRepository.deleteById(curationId);
    }

    /**
     * 일정 개수 이상 신고된 큐레이션 목록을 조회하는 메서드
     *
     * @param minReports 최소 신고 개수
     * @return 신고된 큐레이션 ID 목록
     */
    public List<Long> getReportedCurations(int minReports) {
        List<Curation> reportedCurations = curationRepository.findReportedCurations(minReports);

        // 신고된 큐레이션의 ID 리스트를 반환
        return reportedCurations.stream()
                .map(Curation::getId)
                .toList();
    }

    // ✅ 큐레이션 & 플레이리스트 통계 조회
    public StatsResDto getCurationAndPlaylistStats() {
        long totalCurationViews = curationRepository.sumTotalViews();
        long totalCurationLikes = curationRepository.sumTotalLikes();
        long totalPlaylistViews = playlistRepository.sumTotalViews();
        long totalPlaylistLikes = playlistRepository.sumTotalLikes();

        return new StatsResDto(totalCurationViews, totalCurationLikes, totalPlaylistViews, totalPlaylistLikes);
    }

    public List<Member> getAllMembers(Member member) {
        return memberRepository.findAll();
    }

    public List<ReportedCurationsDetailResDto> getReportedCurationsDetailResDtos(List<Long> reportedcurations) {

        // 1️ 신고 유형별 개수 및 큐레이션 이름 가져오기
        List<Object[]> reportCounts = reportRepository.countReportsWithCurationNamesByCurationIds(reportedcurations);

        // 2️ 큐레이션 ID -> 큐레이션 이름 맵 생성
        Map<Long, String> curationNameMap = new HashMap<>();

        // 3️ 큐레이션 ID -> 신고 유형별 개수 맵핑
        Map<Long, List<ReportedCurationsDetailResDto.ReportCountResDto>> reportTypeCountMap = new HashMap<>();

        for (Object[] row : reportCounts) {
            Long curationId = (Long) row[0];
            String curationTitle = (String) row[1]; // 큐레이션 제목
            ReportType reportType = (ReportType) row[2];
            Long count = (Long) row[3];

            // 큐레이션 이름 저장
            curationNameMap.put(curationId, curationTitle);

            // 신고 유형별 개수 저장
            reportTypeCountMap.computeIfAbsent(curationId, k -> new ArrayList<>())
                    .add(new ReportedCurationsDetailResDto.ReportCountResDto(reportType, count));
        }

        // 4️ 최종 DTO 리스트 생성
        return reportedcurations.stream()
                .map(curationId -> new ReportedCurationsDetailResDto(
                        curationId,
                        curationNameMap.get(curationId), // 큐레이션 이름 추가
                        reportTypeCountMap.getOrDefault(curationId, new ArrayList<>()) // 신고 유형별 개수
                ))
                .collect(Collectors.toList());

    }
}
