package com.team8.project2.domain.curation.curation.event;

import java.util.List;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.team8.project2.domain.image.entity.CurationImage;
import com.team8.project2.domain.image.repository.CurationImageRepository;
import com.team8.project2.domain.image.service.S3Uploader;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class CurationEventListener {

	private final CurationImageRepository curationImageRepository;
	private final S3Uploader s3Uploader;

	/**
	 * 큐레이션이 수정되었을 때, 큐레이션 내용에서 삭제된 이미지를 DB와 S3에서 이미지를 삭제 처리한다.
	 * @param event 큐레이션 수정 이벤트
	 */
	@Async
	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
	public void deleteImageForUpdatedCuration(CurationUpdateEvent event) {
		log.info("큐레이션 수정 이벤트 리스너 실행");
		Long curationId = event.getCurationId();
		List<String> imageUrls = event.getImageUrls();

		List<CurationImage> savedImages = curationImageRepository.findByCurationId(curationId);
		savedImages.removeAll(imageUrls);

		// 큐레이션에서 삭제된 이미지 S3, DB에서 제거
		for (CurationImage savedImage : savedImages) {
			s3Uploader.deleteFile(savedImage.getImageName());
			log.info("S3에서 {}를 삭제했습니다.", savedImage.getImageName());
			curationImageRepository.delete(savedImage);
			log.info("DB에서 {}를 삭제했습니다.", savedImage.getImageName());
		}
	}

	/**
	 * 큐레이션이 삭제되었을 때, 연결된 이미지를 DB와 S3에서 이미지를 삭제 처리한다.
	 * @param event 큐레이션 삭제 이벤트
	 */
	@Async
	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
	public void deleteImageForDeletedCuration(CurationDeleteEvent event) {
		log.info("큐레이션 삭제 이벤트 리스너 실행");
		Long curationId = event.getCurationId();
		List<CurationImage> savedImages = curationImageRepository.findByCurationId(curationId);

		// 큐레이션에서 삭제된 이미지 S3, DB에서 제거
		for (CurationImage savedImage : savedImages) {
			s3Uploader.deleteFile(savedImage.getImageName());
			log.info("S3에서 {}를 삭제했습니다.", savedImage.getImageName());
			curationImageRepository.delete(savedImage);
			log.info("DB에서 {}를 삭제했습니다.", savedImage.getImageName());
		}
	}
}
