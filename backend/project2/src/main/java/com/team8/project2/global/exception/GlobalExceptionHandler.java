package com.team8.project2.global.exception;

import java.util.stream.Collectors;

import org.slf4j.Logger; // ✅ 추가: 로깅을 위해 Logger import
import org.slf4j.LoggerFactory; // ✅ 추가: LoggerFactory import
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.team8.project2.global.dto.Empty;
import com.team8.project2.global.dto.RsData;

@RestControllerAdvice
public class GlobalExceptionHandler {

	// ✅ 추가: 예외 로깅을 위한 Logger 인스턴스
	private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<RsData<Empty>> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {

		// ✅ 수정: 에러 메시지 포맷 개선 (필드명 : 에러코드 : 기본 메시지)
		String message = e.getBindingResult().getFieldErrors()
				.stream()
				.map(fe -> fe.getField() + " : " + fe.getCode() + " : " + fe.getDefaultMessage())
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

	@ResponseStatus // SpringDoc에서 메서드 인식
	@ExceptionHandler(ServiceException.class)
	public ResponseEntity<RsData<Empty>> handleServiceException(ServiceException ex) { // ✅ 수정: 메서드 이름 변경(ServiceExceptionHandle -> handleServiceException)
		return ResponseEntity
				.status(ex.getStatusCode())
				.body(
						new RsData<>(
								ex.getCode(),
								ex.getMsg()
						)
				);
	}

	/** 400 - Bad Request (BadRequestException 및 IllegalArgumentException) */
	@ResponseStatus
	@ExceptionHandler({BadRequestException.class, IllegalArgumentException.class})
	public ResponseEntity<RsData<Empty>> handleBadRequestException(RuntimeException e) {
		return ResponseEntity
				.status(HttpStatus.BAD_REQUEST)
				.body(new RsData<>("400-2", e.getMessage()));
	}

	/** 404 - Not Found (NotFoundException) */
	@ResponseStatus
	@ExceptionHandler(NotFoundException.class)
	public ResponseEntity<RsData<Empty>> handleNotFoundException(NotFoundException e) {
		return ResponseEntity
				.status(HttpStatus.NOT_FOUND)
				.body(new RsData<>("404-1", e.getMessage()));
	}

	/** 500 - Internal Server Error */
	@ResponseStatus
	@ExceptionHandler(Exception.class)
	public ResponseEntity<RsData<Empty>> handleGlobalException(Exception e) {
		// ✅ 추가: 발생한 예외를 로깅합니다.
		logger.error("Unhandled exception occurred", e);

		return ResponseEntity
				.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(new RsData<>("500-1", "서버 내부 오류가 발생했습니다. 관리자에게 문의하세요."));
	}
}
