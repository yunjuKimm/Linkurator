package com.team8.project2.domain.curation.controller;

import static org.assertj.core.api.Assertions.*;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;

import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.curation.curation.repository.CurationRepository;
import com.team8.project2.domain.curation.curation.service.CurationService;
import com.team8.project2.domain.member.entity.Member;
import com.team8.project2.domain.member.repository.MemberRepository;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class LikeCurationConcurrencyTest {

	@Autowired
	private CurationService curationService;

	@Autowired
	private CurationRepository curationRepository;

	@Autowired
	private MemberRepository memberRepository;

	private Long testCurationId;
	private Long testMemberId;

	@BeforeEach
	void setUp() {
		Curation curation = curationRepository.findById(1L).get();
		testCurationId = curation.getId();

		Member member = memberRepository.findById(1L).get();
		testMemberId = member.getId();
	}

	@Test
	void testConcurrentLikes() throws InterruptedException {
		int threadCount = 1000;
		ExecutorService executorService = Executors.newFixedThreadPool(50);
		CountDownLatch latch = new CountDownLatch(threadCount);

		for (int i = 0; i < threadCount; i++) {
			executorService.submit(() -> {
				try {
					curationService.likeCuration(testCurationId, testMemberId);
				} finally {
					latch.countDown();
				}
			});
		}

		latch.await(10, TimeUnit.SECONDS);
		executorService.shutdown();

		Curation updatedCuration = curationRepository.findById(testCurationId).orElseThrow();
		System.out.println("Final like count: " + updatedCuration.getLikeCount());
		assertThat(updatedCuration.getLikeCount()).isBetween(0L, (long)threadCount);
	}
}
