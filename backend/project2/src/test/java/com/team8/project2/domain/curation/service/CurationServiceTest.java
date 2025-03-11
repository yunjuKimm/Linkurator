package com.team8.project2.domain.curation.service;

import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.curation.curation.entity.CurationLink;
import com.team8.project2.domain.curation.curation.entity.CurationTag;
import com.team8.project2.domain.curation.curation.entity.SearchOrder;
import com.team8.project2.domain.curation.curation.repository.CurationLinkRepository;
import com.team8.project2.domain.curation.curation.repository.CurationRepository;
import com.team8.project2.domain.curation.curation.repository.CurationTagRepository;
import com.team8.project2.domain.curation.curation.service.CurationService;
import com.team8.project2.domain.curation.like.entity.Like;
import com.team8.project2.domain.curation.like.repository.LikeRepository;
import com.team8.project2.domain.curation.tag.entity.Tag;
import com.team8.project2.domain.curation.tag.service.TagService;
import com.team8.project2.domain.link.entity.Link;
import com.team8.project2.domain.link.service.LinkService;
import com.team8.project2.domain.member.entity.Member;
import com.team8.project2.domain.member.repository.MemberRepository;
import com.team8.project2.global.exception.ServiceException;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CurationServiceTest {

	@Mock
	private CurationRepository curationRepository;

	@Mock
	private CurationLinkRepository curationLinkRepository;

	@Mock
	private CurationTagRepository curationTagRepository;

	@Mock
	private MemberRepository memberRepository;

	@Mock
	private LikeRepository likeRepository;

	@Mock
	private LinkService linkService;

	@Mock
	private TagService tagService;

	@Mock
	private RedisTemplate<String, Object> redisTemplate;

	@InjectMocks
	private  CurationService curationService;

	private Curation curation;
	private Link link;
	private Tag tag;
	private Member member;

	@BeforeEach
	public void setup() {
		member = Member.builder()
				.id(1L)
				.username("testUser")
				.email("test@example.com")
				.build();


		curation = Curation.builder()
			.id(1L)
			.title("Test Title")
			.content("Test Content")
			.member(member)
			.build();

		link = Link.builder()
			.id(1L)
			.url("https://test.com")
			.build();

		tag = Tag.builder()
			.name("test")
			.build();


	}

	@Test
	@DisplayName("큐레이션을 생성할 수 있다")
	void createCuration() {
		List<String> urls = Arrays.asList("http://example.com", "http://another-url.com");
		List<String> tags = Arrays.asList("tag1", "tag2", "tag3");

		// Mocking repository and service calls
		when(linkService.getLink(anyString())).thenReturn(link);
		when(tagService.getTag(anyString())).thenReturn(tag);
		when(curationRepository.save(any(Curation.class))).thenReturn(curation);
		when(curationLinkRepository.saveAll(ArgumentMatchers.anyList())).thenReturn(List.of(new CurationLink()));
		when(curationTagRepository.saveAll(ArgumentMatchers.anyList())).thenReturn(List.of(new CurationTag()));

		Curation createdCuration = curationService.createCuration("New Title", "New Content", urls, tags, new Member());

		// Verify interactions
		verify(curationRepository, times(1)).save(any(Curation.class));
		verify(curationLinkRepository, times(1)).saveAll(ArgumentMatchers.anyList());
		verify(curationTagRepository, times(1)).saveAll(ArgumentMatchers.anyList());

		// Check the result
		assert createdCuration != null;
		assert createdCuration.getTitle().equals("New Title");
	}

	@Test
	@DisplayName("큐레이션을 수정할 수 있다")
	void UpdateCuration() {


		// Given: 테스트를 위한 데이터 준비
		List<String> urls = Arrays.asList("http://updated-url.com", "http://another-url.com");
		List<String> tags = Arrays.asList("updated-tag1", "updated-tag2", "updated-tag3");

		// Mocking Curation 객체
		Curation curation = new Curation();
		curation.setId(1L);
		curation.setTitle("Original Title");
		curation.setContent("Original Content");
		curation.setMember(member);

		// Mocking 링크 및 태그
		Link link = new Link();  // Link 객체를 생성하는 코드 필요 (예: getLink 메서드에서 반환할 객체 설정)
		Tag tag = new Tag();     // Tag 객체 생성 (예: getTag 메서드에서 반환할 객체 설정)

		// Mocking 리포지토리 및 서비스 호출
		when(curationRepository.findById(1L)).thenReturn(Optional.of(curation));
		when(linkService.getLink(anyString())).thenReturn(link);
		when(tagService.getTag(anyString())).thenReturn(tag);
		when(curationRepository.save(any(Curation.class))).thenReturn(curation);
		when(curationLinkRepository.saveAll(ArgumentMatchers.anyList())).thenReturn(List.of(new CurationLink()));
		when(curationTagRepository.saveAll(ArgumentMatchers.anyList())).thenReturn(List.of(new CurationTag()));

		// When: 큐레이션 업데이트 호출
		Curation updatedCuration = curationService.updateCuration(1L, "Updated Title", "Updated Content", urls, tags, member);

		// Then: 상호작용 검증
		verify(curationRepository, times(1)).findById(1L);
		verify(curationRepository, times(1)).save(any(Curation.class));
		verify(curationLinkRepository, times(1)).saveAll(ArgumentMatchers.anyList());
		verify(curationTagRepository, times(1)).saveAll(ArgumentMatchers.anyList());

		// 결과 확인
		assertNotNull(updatedCuration);
		assertEquals("Updated Title", updatedCuration.getTitle());
		assertEquals("Updated Content", updatedCuration.getContent());
	}



	@Test
	@DisplayName("실패 - 존재하지 않는 큐레이션을 수정하면 실패한다")
	void UpdateCurationNotFound() {
		Member member = new Member(); // Member 객체 생성
		List<String> urls = Arrays.asList("http://updated-url.com");
		List<String> tags = Arrays.asList("tag1", "tag2", "tag3");

		// Mocking repository to return empty Optional
		when(curationRepository.findById(anyLong())).thenReturn(Optional.empty());

		// Check if exception is thrown
		try {
			curationService.updateCuration(1L, "Updated Title", "Updated Content", urls, tags, member);
		} catch (ServiceException e) {
			assert e.getMessage().contains("해당 큐레이션을 찾을 수 없습니다.");
		}
	}

	@Test
	@DisplayName("큐레이션을 삭제할 수 있다")
	void DeleteCuration() {
		// Mocking repository to return true for existence check
		when(curationRepository.findById(1L)).thenReturn(Optional.of(curation));

		// Mocking the actual delete operation
		doNothing().when(curationRepository).deleteById(anyLong());

		// Execute the service method to delete curation
		curationService.deleteCuration(1L, member.getId());

		// Verify the delete operation was called once
		verify(curationRepository, times(1)).deleteById(1L);
	}

	@Test
	@DisplayName("실패 - 존재하지 않는 큐레이션을 삭제할 수 없다")
	void DeleteCurationNotFound() {
		// Mocking repository to return false for existence check
		when(curationRepository.findById(anyLong())).thenReturn(Optional.empty());

		// Check if exception is thrown
		assertThatThrownBy(() -> curationService.deleteCuration(1L, member.getId()))
				.isInstanceOf(ServiceException.class)
				.hasMessageContaining("해당 큐레이션을 찾을 수 없습니다.");

		// Verify that deleteById is never called because the curation does not exist
		verify(curationRepository, never()).deleteById(anyLong());
	}


	@Test
	@DisplayName("큐레이션을 조회할 수 있다")
	void GetCuration() {
		ValueOperations<String, Object> valueOperations = mock(ValueOperations.class);
		when(redisTemplate.opsForValue()).thenReturn(valueOperations);
		// Mocking repository to return a Curation
		when(curationRepository.findById(anyLong())).thenReturn(Optional.of(curation));

		Curation retrievedCuration = curationService.getCuration(1L, member.getId());

		// Verify the result
		assert retrievedCuration != null;
		assert retrievedCuration.getTitle().equals("Test Title");
	}

	@Test
	@DisplayName("큐레이션 조회수는 한 번만 증가해야 한다")
	void GetCurationMultipleTimes() {
		// Given: Redis와 큐레이션 관련 의존성 준비
		ValueOperations<String, Object> valueOperations = mock(ValueOperations.class);
		when(redisTemplate.opsForValue()).thenReturn(valueOperations);

		// 첫 번째 조회에서만 true 반환하고, 그 이후에는 false 반환하도록 설정
		when(valueOperations.setIfAbsent(anyString(), eq(true), eq(Duration.ofMinutes(10))))
				.thenReturn(true)  // 첫 번째 조회에서는 키가 없으므로 true 반환
				.thenReturn(false); // 두 번째 이후의 조회에서는 키가 이미 있으므로 false 반환

		// 큐레이션 조회 로직이 제대로 동작하도록 설정
		when(curationRepository.findById(1L)).thenReturn(Optional.of(curation));

		// 조회수 초기 상태 저장
		Long initialViewCount = curation.getViewCount();

		// When: 큐레이션을 여러 번 조회한다
		curationService.getCuration(1L, member.getId());  // 첫 번째 조회
		curationService.getCuration(1L, member.getId());  // 두 번째 조회
		curationService.getCuration(1L, member.getId());  // 세 번째 조회

		// Then: 조회수는 한 번만 증가해야 한다
		assertEquals(initialViewCount + 1, curation.getViewCount()); // 조회수가 1만 증가해야 한다.
	}


	@Test
	@DisplayName("실패 - 존재하지 않는 큐레이션을 조회하면 실패한다")
	void GetCurationNotFound() {
		ValueOperations<String, Object> valueOperations = mock(ValueOperations.class);
		when(redisTemplate.opsForValue()).thenReturn(valueOperations);
		// Mocking repository to return empty Optional
		when(curationRepository.findById(anyLong())).thenReturn(Optional.empty());


		// Check if exception is thrown
		try {
			curationService.getCuration(1L, member.getId());
		} catch (ServiceException e) {
			assert e.getMessage().contains("해당 큐레이션을 찾을 수 없습니다.");
		}
	}

	@Test
	void findAllCuration() {
		when(curationRepository.searchByFilters(ArgumentMatchers.anyList(), anyInt(), anyString(), anyString(), any(), any()))
			.thenReturn(List.of(curation));

		List<Curation> foundCurations = curationService.searchCurations(List.of("tag"), "title", "content", null,
			SearchOrder.LATEST);

		// Verify the result
		assert foundCurations != null;
		assert foundCurations.size() == 1;
	}

	@Test
	@DisplayName("큐레이션 좋아요 기능을 테스트합니다.")
	void likeCuration() {
		// Mocking repository to return a Curation
		when(curationRepository.findById(anyLong())).thenReturn(Optional.of(curation));

		// Mocking repository to return a Member
		when(memberRepository.findById(anyLong())).thenReturn(Optional.of(new Member()));

		// Mocking repository to return an empty Optional
		when(likeRepository.findByCurationAndMember(any(Curation.class), any(Member.class))).thenReturn(
			Optional.empty());

		// Call the service method
		curationService.likeCuration(1L, 1L);

		// Verify the interactions
		verify(curationRepository, times(1)).findById(anyLong());
		verify(memberRepository, times(1)).findById(anyLong());
		verify(likeRepository, times(1)).findByCurationAndMember(any(Curation.class), any(Member.class));
		verify(likeRepository, times(1)).save(any(Like.class));
	}

	@Test
	@DisplayName("큐레이션 좋아요를 한 번 더 누르면 취소되고 카운트가 감소해야 합니다.")
	void unlikeCuration() {
		// Mocking repository to return a Curation
		when(curationRepository.findById(anyLong())).thenReturn(Optional.of(curation));

		// Mocking repository to return a Member
		Member member = new Member();
		when(memberRepository.findById(anyLong())).thenReturn(Optional.of(member));

		// Mocking repository to return an existing Like (좋아요를 이미 누른 상태)
		Like existingLike = new Like().setLike(curation, member);
		when(likeRepository.findByCurationAndMember(any(Curation.class), any(Member.class)))
			.thenReturn(Optional.of(existingLike));

		// Call the service method (좋아요 취소)
		curationService.likeCuration(1L, 1L);

		// Verify the interactions
		verify(likeRepository, times(1)).delete(any(Like.class));
		verify(likeRepository, never()).save(any(Like.class)); // 새로운 좋아요가 저장되지 않아야 함
		verify(curationRepository, times(1)).findById(anyLong());
		verify(memberRepository, times(1)).findById(anyLong());
		verify(likeRepository, times(1)).findByCurationAndMember(any(Curation.class), any(Member.class));
	}

	@Test
	@DisplayName("존재하지 않는 큐레이션에 좋아요를 누르면 예외가 발생해야 합니다.")
	void likeNonExistentCuration() {
		// Mocking repository to return empty Optional (큐레이션 없음)
		when(curationRepository.findById(anyLong())).thenReturn(Optional.empty());

		// 예외 발생 검증
		assertThatThrownBy(() -> curationService.likeCuration(1L, 1L))
			.isInstanceOf(EntityNotFoundException.class)
			.hasMessageContaining("해당 큐레이션을 찾을 수 없습니다.");

		// Verify interactions (likeRepository는 호출되지 않아야 함)
		verify(curationRepository, times(1)).findById(anyLong());
		verify(memberRepository, never()).findById(anyLong());
		verify(likeRepository, never()).findByCurationAndMember(any(Curation.class), any(Member.class));
		verify(likeRepository, never()).save(any(Like.class));
	}

	@Test
	@DisplayName("존재하지 않는 멤버가 좋아요를 누르면 예외가 발생해야 합니다.")
	void likeByNonExistentMember() {
		// Mocking repository to return a valid Curation
		when(curationRepository.findById(anyLong())).thenReturn(Optional.of(curation));

		// Mocking repository to return empty Optional (멤버 없음)
		when(memberRepository.findById(anyLong())).thenReturn(Optional.empty());

		// 예외 발생 검증
		assertThatThrownBy(() -> curationService.likeCuration(1L, 1L))
			.isInstanceOf(EntityNotFoundException.class)
			.hasMessageContaining("해당 멤버를 찾을 수 없습니다.");

		// Verify interactions (likeRepository는 호출되지 않아야 함)
		verify(curationRepository, times(1)).findById(anyLong());
		verify(memberRepository, times(1)).findById(anyLong());
		verify(likeRepository, never()).findByCurationAndMember(any(Curation.class), any(Member.class));
		verify(likeRepository, never()).save(any(Like.class));
	}
}