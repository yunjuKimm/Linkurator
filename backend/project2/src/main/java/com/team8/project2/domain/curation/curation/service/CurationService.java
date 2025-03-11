package com.team8.project2.domain.curation.curation.service;

import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.curation.curation.entity.CurationLink;
import com.team8.project2.domain.curation.curation.entity.CurationTag;
import com.team8.project2.domain.curation.curation.entity.SearchOrder;
import com.team8.project2.domain.curation.curation.repository.CurationLinkRepository;
import com.team8.project2.domain.curation.curation.repository.CurationRepository;
import com.team8.project2.domain.curation.curation.repository.CurationTagRepository;
import com.team8.project2.domain.curation.like.entity.Like;
import com.team8.project2.domain.curation.like.repository.LikeRepository;
import com.team8.project2.domain.curation.tag.service.TagService;
import com.team8.project2.domain.link.service.LinkService;
import com.team8.project2.domain.member.entity.Member;
import com.team8.project2.domain.member.repository.MemberRepository;
import com.team8.project2.global.exception.ServiceException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 큐레이션 관련 비즈니스 로직을 처리하는 서비스 클래스입니다.
 * 큐레이션 생성, 수정, 삭제, 조회 및 좋아요 기능을 제공합니다.
 */
@Service
@RequiredArgsConstructor
public class CurationService {

	private final CurationRepository curationRepository;
	private final CurationLinkRepository curationLinkRepository;
	private final CurationTagRepository curationTagRepository;
	private final LinkService linkService;
	private final TagService tagService;
	private final MemberRepository memberRepository;
    private final LikeRepository likeRepository;
	private final RedisTemplate<String, Object> redisTemplate;
	private static final String VIEW_COUNT_KEY = "view_count:"; // Redis 키 접두사

	/**
	 * ✅ 큐레이션 조회수 증가 메서드 추가
	 * @param curationId 조회수를 증가할 큐레이션 ID
	 * @param memberId 조회한 사용자 ID
	 */
	public void increaseViewCount(Long curationId, Long memberId) {
		String key = VIEW_COUNT_KEY + curationId + ":" + memberId; // 사용자와 큐레이션 ID로 키 생성

		// Redis에서 조회한 사용자 정보가 있으면 조회수 증가하지 않음
		if (redisTemplate.hasKey(key)) {
			return; // 이미 조회한 사용자는 조회수 증가하지 않음
		}

		// 조회수 증가 로직
		Curation curation = curationRepository.findById(curationId)
				.orElseThrow(() -> new EntityNotFoundException("해당 큐레이션을 찾을 수 없습니다."));

		// 조회수 증가
		Long beforeCount = curation.getViewCount();
		curation.setViewCount(beforeCount + 1);
		curationRepository.save(curation);

		// Redis에 사용자가 해당 큐레이션을 조회했음을 기록하고 10분 동안 유효하도록 설정
		boolean setResult = redisTemplate.opsForValue().setIfAbsent(key, true, Duration.ofMinutes(10));
	}



	/**
	 * ✅ 특정 큐레이터의 큐레이션 개수를 반환하는 메서드 추가
	 * @param memberId 조회할 큐레이터의 memberId
	 * @return 해당 큐레이터가 작성한 큐레이션 개수
	 */
	public long countByMemberId(String memberId) {
		return curationRepository.countByMemberId(memberId);
	}

	/**
	 * 큐레이션을 생성합니다.
	 * @param title 큐레이션 제목
	 * @param content 큐레이션 내용
	 * @param urls 연결된 링크 목록
	 * @param tags 연결된 태그 목록
	 * @return 생성된 큐레이션 객체
	 */
	@Transactional
	public Curation createCuration(String title, String content, List<String> urls, List<String> tags, Member member) {

		Curation curation = Curation.builder()
			.member(member)
			.title(title)
			.content(content)
			.build();
		curationRepository.save(curation);

		// 큐레이션 - 링크 연결
		List<CurationLink> curationLinks = urls.stream()
			.map(url -> {
				CurationLink curationLink = new CurationLink();
				return curationLink.setCurationAndLink(curation, linkService.getLink(url));
			}).collect(Collectors.toList());
		curationLinkRepository.saveAll(curationLinks);
		curation.setCurationLinks(curationLinks);

		// 큐레이션 - 태그 연결
		List<CurationTag> curationTags = tags.stream()
			.map(tag -> {
				CurationTag curationTag = new CurationTag();
				return curationTag.setCurationAndTag(curation, tagService.getTag(tag));
			}).collect(Collectors.toList());
		curationTagRepository.saveAll(curationTags);
		curation.setTags(curationTags);

		return curation;
	}

	/**
	 * 큐레이션을 수정합니다.
	 * @param curationId 수정할 큐레이션 ID
	 * @param title 새로운 제목
	 * @param content 새로운 내용
	 * @param urls 새로 연결할 링크 목록
	 * @param tags 새로 연결할 태그 목록
	 * @return 수정된 큐레이션 객체
	 */
	@Transactional
	public Curation updateCuration(Long curationId, String title, String content, List<String> urls,
		List<String> tags, Member member) {
		Curation curation = curationRepository.findById(curationId)
			.orElseThrow(() -> new ServiceException("404-1", "해당 글을 찾을 수 없습니다."));

		if (!curation.getMember().getId().equals(member.getId())) {
			throw new ServiceException("403", "권한이 없습니다.");
		}

		curation.setTitle(title);
		curation.setContent(content);

//		 큐레이션 - 링크 연결 업데이트

		List<CurationLink> curationLinks = urls.stream()
			.map(url -> {
				CurationLink curationLink = new CurationLink();
				return curationLink.setCurationAndLink(curation, linkService.getLink(url));
			}).collect(Collectors.toList());
		curationLinkRepository.saveAll(curationLinks);
		curation.getCurationLinks().clear();
		curation.getCurationLinks().addAll(curationLinks);
//		 큐레이션 - 태그 연결 업데이트

		List<CurationTag> curationTags = tags.stream()
			.map(tag -> {
				CurationTag curationTag = new CurationTag();
				return curationTag.setCurationAndTag(curation, tagService.getTag(tag));
			}).collect(Collectors.toList());
		curationTagRepository.saveAll(curationTags);
		curation.getTags().clear();
		curation.getTags().addAll(curationTags);

		return curationRepository.save(curation);
	}

	/**
	 * 큐레이션을 삭제합니다.
	 * @param curationId 삭제할 큐레이션 ID
	 */
	@Transactional
	public void deleteCuration(Long curationId, Long memberId) {
		// 큐레이션이 존재하는지 확인
		Curation curation = curationRepository.findById(curationId)
				.orElseThrow(() -> new ServiceException("404-1", "해당 큐레이션을 찾을 수 없습니다."));

		// 삭제 권한이 있는지 확인 (작성자와 요청자가 같은지 확인)
		if (!curation.getMember().getId().equals(memberId)) {
			throw new ServiceException("403-1", "권한이 없습니다."); // 권한 없음
		}
		curationLinkRepository.deleteByCurationId(curationId);
		curationTagRepository.deleteByCurationId(curationId);
		curationRepository.deleteById(curationId);
	}

	/**
	 * 특정 큐레이션을 조회합니다.
	 * @param curationId 조회할 큐레이션 ID
	 * @return 조회된 큐레이션 객체
	 */
	public Curation getCuration(Long curationId, Long memberId) {
		// 조회수 증가 처리
		increaseViewCount(curationId, memberId);

		return curationRepository.findById(curationId)
			.orElseThrow(() -> new ServiceException("404-1", "해당 글을 찾을 수 없습니다."));
	}

    /**
     * 큐레이션을 검색합니다.
     * @param tags 태그 목록 (선택적)
     * @param title 제목 검색어 (선택적)
     * @param content 내용 검색어 (선택적)
     * @param order 정렬 기준
     * @return 검색된 큐레이션 목록
     */
    public List<Curation> searchCurations(List<String> tags, String title, String content, String author, SearchOrder order) {
        if (tags == null || tags.isEmpty()) {
            // 태그가 없을 경우 필터 없이 검색
            return curationRepository.searchByFiltersWithoutTags(tags, title, content, author, order.name());
        } else {
            // 태그가 있을 경우 태그 필터 적용
            return curationRepository.searchByFilters(tags, tags.size(), title, content, author, order.name());
        }
    }

    /**
     * 큐레이션 좋아요 기능
     * @param curationId 좋아요를 추가할 큐레이션 ID
     */
    @Transactional
    public void likeCuration(Long curationId, Long memberId) {
        Curation curation = curationRepository.findById(curationId)
                .orElseThrow(() -> new EntityNotFoundException("해당 큐레이션을 찾을 수 없습니다."));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("해당 멤버를 찾을 수 없습니다."));

        likeRepository.findByCurationAndMember(curation, member).ifPresentOrElse(
                // 이미 좋아요를 눌렀다면 삭제
                like -> {
                    likeRepository.delete(like);
                    curation.setLikeCount(curation.getLikeCount() - 1);
                },
                // 좋아요를 누르지 않았다면 추가
                () -> {
                    Like newLike = new Like().setLike(curation, member);
                    likeRepository.save(newLike);
                    curation.setLikeCount(curation.getLikeCount() + 1);
                }
        );
    }
}