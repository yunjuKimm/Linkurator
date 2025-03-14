package com.team8.project2.domain.curation.curation.service;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.team8.project2.domain.curation.curation.dto.CurationDetailResDto;
import com.team8.project2.domain.curation.curation.dto.CurationResDto;
import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.curation.curation.entity.CurationLink;
import com.team8.project2.domain.curation.curation.entity.CurationTag;
import com.team8.project2.domain.curation.curation.entity.SearchOrder;
import com.team8.project2.domain.curation.curation.event.CurationDeleteEvent;
import com.team8.project2.domain.curation.curation.event.CurationUpdateEvent;
import com.team8.project2.domain.curation.curation.repository.CurationLinkRepository;
import com.team8.project2.domain.curation.curation.repository.CurationRepository;
import com.team8.project2.domain.curation.curation.repository.CurationTagRepository;
import com.team8.project2.domain.curation.like.entity.Like;
import com.team8.project2.domain.curation.like.repository.LikeRepository;
import com.team8.project2.domain.curation.tag.service.TagService;
import com.team8.project2.domain.image.entity.CurationImage;
import com.team8.project2.domain.image.repository.CurationImageRepository;
import com.team8.project2.domain.link.service.LinkService;
import com.team8.project2.domain.member.entity.Member;
import com.team8.project2.domain.member.repository.FollowRepository;
import com.team8.project2.domain.member.repository.MemberRepository;
import com.team8.project2.global.Rq;
import com.team8.project2.global.exception.ServiceException;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

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
	private final CurationImageRepository curationImageRepository;
	private final LinkService linkService;
	private final TagService tagService;
	private final MemberRepository memberRepository;
	private final LikeRepository likeRepository;
	private final ApplicationEventPublisher eventPublisher;
	private final CurationViewService curationViewService;
	private final Rq rq;

	private final RedisTemplate<String, Object> redisTemplate;
	private static final String VIEW_COUNT_KEY = "view_count:"; // Redis 키 접두사
	private static final String LIKE_COUNT_KEY = "curation:like_count"; // 좋아요 수 저장
	private final FollowRepository followRepository;

	/**
	 * ✅ 특정 큐레이터의 큐레이션 개수를 반환하는 메서드 추가
	 * @param member 조회할 큐레이터의 memberId
	 * @return 해당 큐레이터가 작성한 큐레이션 개수
	 */
	@Transactional
	public long countByMember(Member member) {
		return curationRepository.countByMemberId(member.getMemberId());
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

		// 작성한 큐레이션에 이미지가 첨부되어 있다면, 이미지에 큐레이션 번호를 연결 (연결이 이미 있는 이미지는 무시)
		List<String> imageNames = curation.getImageNames();

		for (int i = 0; i < imageNames.size(); i++) {
			System.out.println(i + ": " + imageNames.get(i));
		}

		for (String imageName : imageNames) {
			Optional<CurationImage> opImage = curationImageRepository.findByImageName(imageName);
			if (opImage.isPresent()) {
				CurationImage curationImage = opImage.get();
				curationImage.setCurationIdIfNull(curation.getId());
				curationImageRepository.save(curationImage);
			}
		}

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

		// 큐레이션 - 링크 연결 업데이트
		List<CurationLink> curationLinks = urls.stream()
			.map(url -> {
				CurationLink curationLink = new CurationLink();
				return curationLink.setCurationAndLink(curation, linkService.getLink(url));
			}).collect(Collectors.toList());
		curationLinkRepository.saveAll(curationLinks);
		curation.getCurationLinks().clear();
		curation.getCurationLinks().addAll(curationLinks);

		// 큐레이션 - 태그 연결 업데이트
		List<CurationTag> curationTags = tags.stream()
			.map(tag -> {
				CurationTag curationTag = new CurationTag();
				return curationTag.setCurationAndTag(curation, tagService.getTag(tag));
			}).collect(Collectors.toList());
		curationTagRepository.saveAll(curationTags);
		curation.getTags().clear();
		curation.getTags().addAll(curationTags);

		Curation result = curationRepository.save(curation);

		// 큐레이션 수정 이벤트
		eventPublisher.publishEvent(CurationUpdateEvent.builder()
			.curationId(curation.getId())
			.imageUrls(curation.getImageNames())
			.build());

		return result;
	}

	/**
	 * 큐레이션을 삭제합니다.
	 * @param curationId 삭제할 큐레이션 ID
	 */
	@Transactional
	public void deleteCuration(Long curationId, Member member) {
		// 큐레이션이 존재하는지 확인
		Curation curation = curationRepository.findById(curationId)
				.orElseThrow(() -> new ServiceException("404-1", "해당 큐레이션을 찾을 수 없습니다."));

		// 삭제 권한이 있는지 확인 (작성자와 요청자가 같은지 확인)
		System.out.println("어드민이야?" + member.isAdmin());
		if (!curation.getMember().getId().equals(member.getMemberId()) && !member.isAdmin()) {
			throw new ServiceException("403-1", "권한이 없습니다."); // 권한 없음
		}
		curationLinkRepository.deleteByCurationId(curationId);
		curationTagRepository.deleteByCurationId(curationId);
		curationRepository.deleteById(curationId);

		// 큐레이션 삭제 이벤트
		eventPublisher.publishEvent(new CurationDeleteEvent(curationId));
	}

	/**
	 * 특정 큐레이션을 조회합니다.
	 * @param curationId 조회할 큐레이션 ID
	 * @return 조회된 큐레이션 객체
	 */
	@Transactional
	public CurationDetailResDto getCuration(Long curationId, HttpServletRequest request) {
		String ip = request.getHeader("X-Forwarded-For");

		if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("Proxy-Client-IP");
		}
		if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("WL-Proxy-Client-IP");
		}
		if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("HTTP_CLIENT_IP");
		}
		if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("HTTP_X_FORWARDED_FOR");
		}
		if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("X-Real-IP");
		}
		if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("X-RealIP");
		}
		if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("REMOTE_ADDR");
		}
		if (ip == null || ip.length() == 0 || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getRemoteAddr();
		}

		if(ip.equals("0:0:0:0:0:0:0:1") || ip.equals("127.0.0.1"))
		{
            InetAddress address = null;
            try {
                address = InetAddress.getLocalHost();
            } catch (UnknownHostException e) {
                throw new RuntimeException(e);
            }
            ip = address.getHostName() + "/" + address.getHostAddress();
		}
		String key = VIEW_COUNT_KEY + curationId + ":" + ip;
		System.out.println("Redis Key: " + key);
		boolean isNewView = redisTemplate.opsForValue().setIfAbsent(key, String.valueOf(true), Duration.ofMinutes(10));
		System.out.println("Redis Key Set? " + isNewView + " | Key: " + key);

		Curation curation = curationRepository.findById(curationId)
				.orElseThrow(() -> new ServiceException("404-1", "해당 큐레이션을 찾을 수 없습니다."));

		boolean isLogin = false;
		boolean isLiked = false;
		boolean isFollowed = false;
		if (rq.isLogin()) {
			isLogin = true;
			Member actor = rq.getActor();
			isLiked = isLikedByMember(curationId, actor.getId());
			isFollowed = isFollowed(curation.getMemberId(), actor.getId());
		}

		if (isNewView) {
			curationViewService.increaseViewCount(curation);
		} else {
			System.out.println("조회수 증가 안 함 (이미 조회된 IP)");
		}

		return CurationDetailResDto.fromEntity(curation, isLiked, isFollowed, isLogin);
	}

	private boolean isFollowed(Long followeeId, Long followerId) {
		return followRepository.existsByFollowerIdAndFolloweeId(followerId, followeeId);
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

	@Transactional
	public void likeCuration(Long curationId, Long memberId) {
		Curation curation = curationRepository.findById(curationId)
				.orElseThrow(() -> new ServiceException("404-1", "해당 큐레이션을 찾을 수 없습니다."));

		Member member = memberRepository.findById(memberId)
				.orElseThrow(() -> new ServiceException("404-1", "해당 멤버를 찾을 수 없습니다."));

		Optional<Like> existingLike = likeRepository.findByCurationAndMember(curation, member);

		if (existingLike.isPresent()) {
			// 좋아요 삭제
			likeRepository.delete(existingLike.get());

			// ✅ Redis에서 좋아요 개수를 먼저 감소
			Double updatedLikes = redisTemplate.opsForZSet().incrementScore(LIKE_COUNT_KEY, curationId.toString(), -1);
			curation.setLikeCount(updatedLikes != null && updatedLikes > 0 ? updatedLikes.longValue() : 0);
		} else {
			// 좋아요 추가
			Like newLike = new Like().setLike(curation, member);
			likeRepository.save(newLike);

			// ✅ Redis에서 좋아요 개수를 먼저 증가
			Double updatedLikes = redisTemplate.opsForZSet().incrementScore(LIKE_COUNT_KEY, curationId.toString(), 1);
			curation.setLikeCount(updatedLikes.longValue());
		}

		// ✅ 변경된 좋아요 개수를 DB에 저장
		curationRepository.save(curation);
	}

	/**
	 * 특정 큐레이션에 대한 좋아요 여부를 확인합니다.
	 * @param curationId 큐레이션 ID
	 * @param memberId 사용자 ID
	 * @return 좋아요 여부 (true: 좋아요 누름, false: 좋아요 안 누름)
	 */
	public boolean isLikedByMember(Long curationId, Long memberId) {
		return likeRepository.existsByCurationIdAndMemberId(curationId, memberId);
	}


	/**
	 * ✅ 특정 멤버가 팔로우하는 큐레이션 목록을 조회하는 메서드 추가
	 * @param member 팔로우한 멤버
	 * @return 팔로우한 멤버의 큐레이션 목록
	 */
	public List<CurationResDto> getFollowingCurations(Member member) {
		List<Curation> followingCurations = curationRepository.findFollowingCurations(member.getId());
		return followingCurations.stream()
				.map(CurationResDto::new)
				.collect(Collectors.toList());
	}

}