package com.team8.project2.domain.comment.service;

import com.team8.project2.domain.comment.dto.CommentDto;
import com.team8.project2.domain.comment.entity.Comment;
import com.team8.project2.domain.comment.repository.CommentRepository;
import com.team8.project2.domain.curation.curation.entity.Curation;
import com.team8.project2.domain.curation.curation.repository.CurationRepository;
import com.team8.project2.domain.member.entity.Member;
import com.team8.project2.domain.member.repository.MemberRepository;
import com.team8.project2.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 댓글(Comment) 관련 비즈니스 로직을 처리하는 서비스 클래스입니다.
 * 댓글 작성, 조회, 삭제 기능을 제공합니다.
 * 특정 큐레이션(Curation)과 연관된 댓글을 관리합니다.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

   private final CommentRepository commentRepository;
   private final CurationRepository curationRepository;
   private final MemberRepository memberRepository;

   /**
    * 새로운 댓글을 생성합니다.
    * @param commentDto 댓글 생성 요청 데이터
    * @return 생성된 댓글의 정보를 반환합니다.
    * @throws ServiceException 큐레이션 ID가 제공되지 않거나 존재하지 않을 경우 예외 발생
    */
   public CommentDto createComment(Long curationId, CommentDto commentDto) {
       // curationId를 이용해 Curation 조회
       Curation curation = curationRepository.findById(curationId)
               .orElseThrow(() -> new ServiceException("CURATION_NOT_FOUND",
                       "해당 큐레이션을 찾을 수 없습니다. (id: " + curationId + ")"));

       // Member 미구현으로 임시 Member 사용
       Member member = memberRepository.findAll().stream()
           .findFirst()
           .orElseThrow(() -> new ServiceException("500-1","등록된 회원이 없습니다. 인증 정보를 가져올 수 없습니다."));

       // Curation 객체를 사용해 Comment 생성
       Comment comment = commentDto.toEntity(member, curation);
       Comment savedComment = commentRepository.save(comment);
       return CommentDto.fromEntity(savedComment);
   }

   /**
    * 특정 큐레이션 ID에 해당하는 모든 댓글을 조회합니다.
    * @param curationId 큐레이션 ID
    * @return 해당 큐레이션에 등록된 댓글 목록을 반환합니다.
    */
   public List<CommentDto> getCommentsByCurationId(Long curationId) {
       List<Comment> comments = commentRepository.findByCurationId(curationId);
       return comments.stream()
               .map(CommentDto::fromEntity)
               .collect(Collectors.toList());
   }

   /**
    * 특정 댓글을 삭제합니다.
    * @param commentId 삭제할 댓글 ID
    * @throws ServiceException 해당 댓글이 존재하지 않을 경우 예외 발생
    */
   public void deleteComment(Long commentId) {
       Comment comment = commentRepository.findById(commentId)
               .orElseThrow(() -> new ServiceException("COMMENT_NOT_FOUND", "해당 댓글을 찾을 수 없습니다."));
       commentRepository.delete(comment);
   }
}

