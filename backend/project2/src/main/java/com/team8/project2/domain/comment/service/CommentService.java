package com.team8.project2.domain.comment.service;

import com.team8.project2.domain.comment.dto.CommentDto;
import com.team8.project2.domain.comment.entity.Comment;
import com.team8.project2.domain.comment.repository.CommentRepository;
import com.team8.project2.domain.curation.entity.Curation;
import com.team8.project2.domain.curation.repository.CurationRepository;
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

//    private final CommentRepository commentRepository;
//    private final CurationRepository curationRepository;
//
//        // curationId가 Long 타입인지 확인
//        if (commentDto.getCurationId() == null) {
//            throw new ServiceException("CURATION_ID_NULL", "큐레이션 ID가 제공되지 않았습니다.");
//        }
//
//        // curationId를 이용해 Curation 조회
//        Curation curation = curationRepository.findById(commentDto.getCurationId())
//                .orElseThrow(() -> new ServiceException("CURATION_NOT_FOUND",
//                        "해당 큐레이션을 찾을 수 없습니다. (id: " + commentDto.getCurationId() + ")"));
//
//        // Curation 객체를 사용해 Comment 생성
//        Comment comment = commentDto.toEntity(curation);
//        Comment savedComment = commentRepository.save(comment);
//        return CommentDto.fromEntity(savedComment);
//    }
//
//    public List<CommentDto> getCommentsByCurationId(Long curationId) {
//        List<Comment> comments = commentRepository.findByCurationId(curationId);
//        return comments.stream()
//                .map(CommentDto::fromEntity)
//                .collect(Collectors.toList());
//    }
//
//    public void deleteComment(Long commentId) {
//        Comment comment = commentRepository.findById(commentId)
//                .orElseThrow(() -> new ServiceException("COMMENT_NOT_FOUND", "해당 댓글을 찾을 수 없습니다."));
//        commentRepository.delete(comment);
//    }
}
