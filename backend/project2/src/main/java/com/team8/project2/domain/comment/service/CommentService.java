package com.team8.project2.domain.comment.service;

import com.team8.project2.domain.comment.dto.CommentDto;
import com.team8.project2.domain.comment.entity.Comment;
import com.team8.project2.domain.comment.repository.CommentRepository;
import com.team8.project2.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;

    public CommentDto createComment(CommentDto commentDto) {
        Comment comment = commentDto.toEntity();
        Comment savedComment = commentRepository.save(comment);
        return CommentDto.fromEntity(savedComment);
    }

    public List<CommentDto> getCommentsByCurationId(Long curationId) {
        List<Comment> comments = commentRepository.findByCurationId(curationId);
        return comments.stream()
                .map(CommentDto::fromEntity)
                .collect(Collectors.toList());
    }

    public void deleteComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ServiceException("COMMENT_NOT_FOUND", "해당 댓글을 찾을 수 없습니다."));
        commentRepository.delete(comment);
    }
}
