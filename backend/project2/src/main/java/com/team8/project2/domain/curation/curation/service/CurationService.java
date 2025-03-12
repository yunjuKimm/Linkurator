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
import jakarta.servlet.http.HttpServletRequest;
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
			.orElseThrow(() -> new ServiceException("404-1", "해당 큐레이션을 찾을 수 없습니다."));

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
	public Curation getCuration(Long curationId, HttpServletRequest request) {
		String ip = request.getRemoteAddr();  // 클라이언트 IP 주소 추출
		String key = VIEW_COUNT_KEY + curationId + ":" + ip;

		// Redis에 먼저 키 저장 (최초 요청만 true 반환, 10분 유지)
		boolean isNewView = redisTemplate.opsForValue().setIfAbsent(key, String.valueOf(true), Duration.ofMinutes(10));
		System.out.println("Redis Key Set? " + isNewView + " | Key: " + key);

		// 큐레이션 조회
		Curation curation = curationRepository.findById(curationId)
				.orElseThrow(() -> new ServiceException("404-1", "해당 큐레이션을 찾을 수 없습니다."));

		// 새로운 조회일 때만 조회수 증가
		if (isNewView) {
			increaseViewCount(curation);
			System.out.println("조회수 증가! 현재 조회수: " + curation.getViewCount());
		} else {
			System.out.println("조회수 증가 안 함 (이미 조회된 IP)");
		}

		return curation;
	}

	@Transactional
	public void increaseViewCount(Curation curation) {
		curation.setViewCount(curation.getViewCount() + 1);
		curationRepository.save(curation);
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
		String likeQueueKey = "like:queue:" + curationId;
		String userLikeKey = "like:" + curationId + ":" + memberId;

		// 여기에서 먼저 존재 여부 확인
		Curation curation = curationRepository.findById(curationId)
				.orElseThrow(() -> new ServiceException("404-1", "해당 큐레이션을 찾을 수 없습니다."));

		Member member = memberRepository.findById(memberId)
				.orElseThrow(() -> new ServiceException("404-1", "해당 멤버를 찾을 수 없습니다."));

		// 좋아요 이벤트를 Redis 큐에 추가
		redisTemplate.opsForList().leftPush(likeQueueKey, String.valueOf(memberId));
		redisTemplate.opsForValue().set(userLikeKey, "liked", Duration.ofMinutes(10));

		// 비동기 처리 실행
		processLikeQueue(likeQueueKey, curation, member);
	}

	public void processLikeQueue(String likeQueueKey, Curation curation, Member member) {
		// 큐에서 좋아요 이벤트를 하나씩 처리하는 로직
		new Thread(() -> {
			try {
				// 큐에서 멤버 아이디를 하나씩 꺼내서 처리
				while (true) {
					String memberId = (String) redisTemplate.opsForList().rightPop(likeQueueKey, Duration.ofSeconds(10)); // 큐에서 하나씩 꺼냄

					if (memberId == null) {
						break; // 큐에 더 이상 처리할 데이터가 없으면 종료
					}


					// 좋아요 처리
					likeRepository.findByCurationAndMember(curation, member).ifPresentOrElse(
							like -> {
								// 이미 좋아요가 있으면 삭제
								likeRepository.delete(like);
								curation.setLikeCount(curation.getLikeCount() - 1);
							},
							() -> {
								// 좋아요가 없으면 추가
								Like newLike = new Like().setLike(curation, member);
								likeRepository.save(newLike);
								curation.setLikeCount(curation.getLikeCount() + 1);
							}
					);

					// 변경 사항 저장
					curationRepository.save(curation);
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}).start(); // 비동기 작업을 별도의 스레드에서 실행
	}


}