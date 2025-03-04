package com.team8.project2.domain.comment.controller;

import com.team8.project2.domain.comment.dto.CommentDto;
import com.team8.project2.domain.comment.service.CommentService;
import com.team8.project2.global.dto.Empty;
import com.team8.project2.global.dto.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/comments")
public class ApiV1CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<RsData<CommentDto>> createComment(@RequestBody CommentDto commentDto) {
        CommentDto createdComment = commentService.createComment(commentDto);
        return ResponseEntity.ok(RsData.success(createdComment));
    }

    @GetMapping("/{curationId}")
    public ResponseEntity<RsData<List<CommentDto>>> getCommentsByCurationId(@PathVariable Long curationId) {
        List<CommentDto> comments = commentService.getCommentsByCurationId(curationId);
        return ResponseEntity.ok(RsData.success(comments));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<RsData<Empty>> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.ok(RsData.success(new Empty()));
    }
}
