package com.team8.project2.global.exception;

import java.util.stream.Collectors;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.team8.project2.global.dto.Empty;
import com.team8.project2.global.dto.RsData;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<RsData<Empty>> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {

		String message = e.getBindingResult().getFieldErrors()
			.stream()
			.map(fe -> fe.getField() + " : " + fe.getCode() + " : "  + fe.getDefaultMessage())
			.sorted()
			.collect(Collectors.joining("\n"));

		return ResponseEntity
			.status(HttpStatus.BAD_REQUEST)
			.body(
				new RsData<>(
					"400-1",
					message
				)
			);
	}

	/** 404 - Not Found (EntityNotFoundException) */
	@ExceptionHandler(EntityNotFoundException.class)
	public ResponseEntity<RsData<Empty>> handleEntityNotFoundException(EntityNotFoundException e) {
		return ResponseEntity
				.status(HttpStatus.NOT_FOUND)
				.body(new RsData<>("404-1", e.getMessage()));
	}

	/** 400 - 잘못된 요청 (IllegalArgumentException) */
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<RsData<Empty>> handleIllegalArgumentException(IllegalArgumentException e) {
		return ResponseEntity
				.status(HttpStatus.BAD_REQUEST)
				.body(new RsData<>("400-2", e.getMessage()));
	}

	/** 500 - 서버 내부 에러 (예상치 못한 모든 예외) */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<RsData<Empty>> handleGlobalException(Exception e) {
		return ResponseEntity
				.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new RsData<>("500-1", "서버 내부 오류가 발생했습니다. 관리자에게 문의하세요."));
	}
}
