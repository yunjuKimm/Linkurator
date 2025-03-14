package com.team8.project2.domain.admin.service;

import com.team8.project2.domain.admin.dto.StatsResDto;
import com.team8.project2.domain.curation.curation.repository.CurationRepository;
import com.team8.project2.domain.member.repository.MemberRepository;
import com.team8.project2.domain.playlist.repository.PlaylistRepository;
import com.team8.project2.global.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final CurationRepository curationRepository;
    private final MemberRepository memberRepository;
    private final PlaylistRepository playlistRepository;

    // ✅ 관리자용 큐레이션 삭제
    @Transactional
    public void deleteCuration(Long curationId) {
        if (!curationRepository.existsById(curationId)) {
            throw new NotFoundException("큐레이션을 찾을 수 없습니다.");
        }
        curationRepository.deleteById(curationId);
    }

    // ✅ 관리자용 멤버 삭제
    @Transactional
    public void deleteMember(Long memberId) {
        if (!memberRepository.existsById(memberId)) {
            throw new NotFoundException("멤버를 찾을 수 없습니다.");
        }
        memberRepository.deleteById(memberId);
    }

    // ✅ 일정 개수 이상 신고된 큐레이션 조회
    public List<Long> getReportedCurations(int minReports) {
        return curationRepository.findReportedCurationIds(minReports);
    }

    // ✅ 큐레이션 & 플레이리스트 통계 조회
    public StatsResDto getCurationAndPlaylistStats() {
        long totalCurationViews = curationRepository.sumTotalViews();
        long totalCurationLikes = curationRepository.sumTotalLikes();
        long totalPlaylistViews = playlistRepository.sumTotalViews();
        long totalPlaylistLikes = playlistRepository.sumTotalLikes();

        return new StatsResDto(totalCurationViews, totalCurationLikes, totalPlaylistViews, totalPlaylistLikes);
    }
}
