"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, Edit, Trash2, X, Check } from "lucide-react";

// 댓글 데이터 타입 정의를 API 응답 구조에 맞게 수정
type Comment = {
  id?: number;
  commentId?: number; // API 응답에서는 commentId로 제공됨
  authorId?: number;
  authorName: string;
  authorImgUrl?: string;
  content: string;
  createdAt: string;
  modifiedAt: string;
  isLiked?: boolean;
};

// API에서 받은 데이터 타입
type CurationData = {
  title: string;
  content: string;
  comments: Comment[];
};

// 댓글 섹션 컴포넌트
export default function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]); // 댓글 상태
  const [newComment, setNewComment] = useState(""); // 새 댓글 상태
  const [isSubmitting, setIsSubmitting] = useState(false); // 제출 중 상태
  const [error, setError] = useState<string | null>(null); // 오류 상태
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null); // 수정 중인 댓글 ID
  const [editContent, setEditContent] = useState(""); // 수정 중인 댓글 내용

  // API에서 커레이션 데이터를 불러오는 함수 수정
  const fetchCurationData = async (id: string) => {
    try {
      setError(null);
      const res = await fetch(`http://localhost:8080/api/v1/curation/${id}`);

      if (!res.ok) {
        throw new Error("댓글 데이터를 불러오는 데 실패했습니다.");
      }

      const data = await res.json();
      if (data.code === "200-1" || data.code === "200-OK") {
        // API 응답에서 commentId를 사용하므로 이를 처리
        const commentsWithId =
          data.data.comments?.map((comment: any) => ({
            ...comment,
            id: comment.commentId, // id 필드를 추가하여 일관성 유지
          })) || [];
        setComments(commentsWithId);
      } else {
        throw new Error(data.msg || "댓글 데이터를 불러오는 데 실패했습니다.");
      }
    } catch (error) {
      console.error("API 호출 중 오류 발생:", error);
      setError((error as Error).message);
    }
  };

  // 컴포넌트 마운트 시 API 호출
  useEffect(() => {
    fetchCurationData(postId); // 주어진 postId로 커레이션 데이터를 가져옵니다.
  }, [postId]);

  // 댓글 좋아요 기능 (미구현)
  const handleLikeComment = (commentId: string) => {
    setComments(
      comments.map((comment, index) => {
        if (commentId === index.toString()) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
          };
        }
        return comment;
      })
    );
  };

  // 새 댓글 작성 기능 - API 연결
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // API 호출로 댓글 생성
      const response = await fetch(
        `http://localhost:8080/api/v1/curations/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: newComment,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("댓글 작성에 실패했습니다.");
      }

      const result = await response.json();

      if (result.code === "200-OK") {
        // API 응답으로 받은 새 댓글 데이터
        const newCommentData: Comment = {
          id: result.data.id,
          commentId: result.data.id,
          authorName: result.data.authorName,
          content: result.data.content,
          createdAt: result.data.createdAt,
          modifiedAt: result.data.modifiedAt,
          isLiked: false,
          authorImgUrl: "/placeholder.svg?height=36&width=36", // 기본 이미지 설정
        };

        // 댓글 목록 업데이트
        setComments([newCommentData, ...comments]);
        setNewComment(""); // 입력 필드 초기화
      } else {
        throw new Error(result.msg || "댓글 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 작성 중 오류 발생:", error);
      setError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 댓글 수정 시작
  const handleEditStart = (comment: Comment) => {
    if (comment.id) {
      setEditingCommentId(comment.id);
      setEditContent(comment.content);
    }
  };

  // 댓글 수정 취소
  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  // 댓글 수정 저장 함수 수정
  const handleEditSave = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // API 호출로 댓글 수정
      const response = await fetch(
        `http://localhost:8080/api/v1/curations/${postId}/comments/${commentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: editContent,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("댓글 수정에 실패했습니다.");
      }

      const result = await response.json();

      if (result.code === "200-OK") {
        // 댓글 목록 업데이트
        setComments(
          comments.map((comment) => {
            if (comment.id === commentId || comment.commentId === commentId) {
              return {
                ...comment,
                content: editContent,
                modifiedAt: result.data.modifiedAt || new Date().toISOString(),
              };
            }
            return comment;
          })
        );

        // 수정 모드 종료
        setEditingCommentId(null);
        setEditContent("");
      } else {
        throw new Error(result.msg || "댓글 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 수정 중 오류 발생:", error);
      setError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 댓글 삭제 함수 수정
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("정말로 이 댓글을 삭제하시겠습니까?")) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // API 호출로 댓글 삭제
      const response = await fetch(
        `http://localhost:8080/api/v1/curations/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("댓글 삭제에 실패했습니다.");
      }

      const result = await response.json();

      if (result.code === "200-1") {
        // 댓글 목록에서 삭제된 댓글 제거
        setComments(
          comments.filter(
            (comment) =>
              comment.id !== commentId && comment.commentId !== commentId
          )
        );
      } else {
        throw new Error(result.msg || "댓글 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("댓글 삭제 중 오류 발생:", error);
      setError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 날짜 형식화 함수
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "유효하지 않은 날짜";
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return "날짜 형식 오류";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">댓글 {comments.length}개</h2>

      <form onSubmit={handleAddComment} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 작성해주세요..."
          className="w-full rounded-md border p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={3}
          disabled={isSubmitting}
        />

        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? "작성 중..." : "댓글 작성"}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div
              key={comment.commentId || comment.id || index}
              className="rounded-lg border p-4"
            >
              <div className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <Image
                    src={
                      comment.authorImgUrl ||
                      "/placeholder.svg?height=36&width=36"
                    }
                    alt={comment.authorName}
                    width={36}
                    height={36}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-medium">{comment.authorName}</p>
                    <p className="text-xs text-gray-500">
                      {comment.createdAt &&
                      comment.modifiedAt &&
                      Math.floor(
                        new Date(comment.modifiedAt).getTime() / 1000
                      ) !==
                        Math.floor(new Date(comment.createdAt).getTime() / 1000)
                        ? `수정된 날짜: ${formatDate(comment.modifiedAt)}`
                        : `작성된 날짜: ${formatDate(comment.createdAt)}`}
                    </p>
                  </div>
                </div>

                {/* 댓글 액션 버튼 */}
                <div className="flex space-x-1">
                  {comment.id !== editingCommentId &&
                  comment.commentId !== editingCommentId ? (
                    <>
                      <button
                        onClick={() => handleEditStart(comment)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteComment(
                            comment.commentId || comment.id || 0
                          )
                        }
                        className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          handleEditSave(comment.commentId || comment.id || 0)
                        }
                        className="p-1 text-green-500 hover:text-green-600 rounded-full hover:bg-gray-100"
                        disabled={isSubmitting}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="p-1 text-red-500 hover:text-red-600 rounded-full hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {comment.id !== editingCommentId &&
              comment.commentId !== editingCommentId ? (
                <p className="mt-2 text-sm">{comment.content}</p>
              ) : (
                <div className="mt-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full rounded-md border p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={2}
                    disabled={isSubmitting}
                  />
                </div>
              )}

              <div className="mt-3 flex items-center space-x-4">
                <button
                  onClick={() => handleLikeComment(index.toString())}
                  className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      comment.isLiked ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                  <span>{comment.isLiked ? 1 : 0}</span>
                </button>
                <button className="text-xs text-gray-500 hover:text-gray-700">
                  답글
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
          </div>
        )}
      </div>
    </div>
  );
}
