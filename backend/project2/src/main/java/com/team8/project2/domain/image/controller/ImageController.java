package com.team8.project2.domain.image.controller;

import java.io.IOException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.team8.project2.domain.image.service.S3Uploader;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/images")
@RequiredArgsConstructor
public class ImageController {

	private final S3Uploader s3Uploader;

	@PostMapping("/upload")
	public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
		try {
			String imageUrl = s3Uploader.uploadFile(file);
			return ResponseEntity.ok(imageUrl);
		} catch (IOException e) {
			return ResponseEntity.status(500).body("파일 업로드 실패");
		}
	}
}