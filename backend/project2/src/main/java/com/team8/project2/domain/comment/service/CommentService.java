package com.team8.project2.domain.comment.service;

import com.team8.project2.domain.comment.dto.CommentDto;
import com.team8.project2.domain.comment.entity.Comment;
import com.team8.project2.domain.comment.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;

    @Transactional
    public CommentDto createComment(CommentDto commentDto) {
        Comment comment = Comment.builder()
                .memberId(commentDto.getMemberId())
                .curationId(commentDto.getCurationId())
                .content(commentDto.getContent())
                .build();

        Comment savedComment = commentRepository.save(comment);
        return CommentDto.fromEntity(savedComment);
    }

    @Transactional
    public List<CommentDto> getCommentsByCurationId(Long curationId) {
        return commentRepository.findByCurationId(curationId)
                .stream()
                .map(CommentDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }
}
