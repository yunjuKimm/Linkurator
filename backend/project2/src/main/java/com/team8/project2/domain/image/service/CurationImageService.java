package com.team8.project2.domain.image.service;

import java.io.IOException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.team8.project2.domain.image.entity.CurationImage;
import com.team8.project2.domain.image.repository.CurationImageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CurationImageService {

	private final S3Uploader s3Uploader;
	private final CurationImageRepository curationImageRepository;

	@Transactional
	public String uploadImage(MultipartFile file) throws IOException {
		String imageUrl;
		imageUrl = s3Uploader.uploadFile(file);

		CurationImage curationImage =  CurationImage.builder()
			.imageName(imageUrl)
			.build();
		curationImageRepository.save(curationImage);

		return imageUrl;
	}
}
