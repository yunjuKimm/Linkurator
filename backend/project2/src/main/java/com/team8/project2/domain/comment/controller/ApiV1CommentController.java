package com.team8.project2.domain.comment.controller;

import com.team8.project2.domain.comment.dto.CommentDto;
import com.team8.project2.domain.comment.service.CommentService;
import com.team8.project2.global.dto.Empty;
import com.team8.project2.global.dto.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 댓글(Comment) API 컨트롤러 클래스입니다.
 * 댓글 생성, 조회 및 삭제 기능을 제공합니다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/comments")
public class ApiV1CommentController {

//    private final CommentService commentService;
//
//    /**
//     * 새로운 댓글을 생성합니다.
//     * @param commentDto 댓글 생성 요청 데이터
//     * @return 생성된 댓글 정보를 포함한 응답
//     */
//    @PostMapping
//    public ResponseEntity<RsData<CommentDto>> createComment(@RequestBody CommentDto commentDto) {
//        CommentDto createdComment = commentService.createComment(commentDto);
//        return ResponseEntity.ok(RsData.success(createdComment));
//    }
//
//    /**
//     * 특정 큐레이션에 속한 댓글 목록을 조회합니다.
//     * @param curationId 큐레이션 ID
//     * @return 해당 큐레이션의 댓글 목록을 포함한 응답
//     */
//    @GetMapping("/{curationId}")
//    public ResponseEntity<RsData<List<CommentDto>>> getCommentsByCurationId(@PathVariable Long curationId) {
//        List<CommentDto> comments = commentService.getCommentsByCurationId(curationId);
//        return ResponseEntity.ok(RsData.success(comments));
//    }
//
//    /**
//     * 특정 댓글을 삭제합니다.
//     * @param commentId 삭제할 댓글 ID
//     * @return 빈 응답 객체를 포함한 응답
//     */
//    @DeleteMapping("/{commentId}")
//    public ResponseEntity<RsData<Empty>> deleteComment(@PathVariable Long commentId) {
//        commentService.deleteComment(commentId);
//        return ResponseEntity.ok(RsData.success(new Empty()));
//    }
}

