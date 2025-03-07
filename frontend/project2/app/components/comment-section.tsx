"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, Flag } from "lucide-react";

// 댓글 데이터 타입 정의
type Comment = {
  authorId: number;
  authorName: string;
  authorImgUrl: string;
  content: string;
  createdAt: string;
  modifiedAt: string;
  isLiked: boolean;
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

  // API에서 커레이션 데이터를 불러오는 함수
  const fetchCurationData = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/curation/${id}`);
      const data = await res.json();
      if (data.code === "200-1") {
        setComments(data.data.comments); // 댓글 데이터를 설정
      } else {
        console.error("댓글 데이터를 불러오는 데 실패했습니다.");
      }
    } catch (error) {
      console.error("API 호출 중 오류 발생:", error);
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

  // 새 댓글 작성 기능
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentObj: Comment = {
      authorName: "현재 사용자",
      content: newComment,
      isLiked: false,
      authorId: 0,
      authorImgUrl: "",
      createdAt: "",
      modifiedAt: "",
    };

    setComments([newCommentObj, ...comments]); // 새 댓글 추가
    setNewComment(""); // 입력 필드 초기화
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
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={!newComment.trim()}
          >
            댓글 작성
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {comments.map((comment, index) => (
          <div key={index} className="rounded-lg border p-4">
            <div className="flex justify-between">
              <div className="flex items-center space-x-2">
                <Image
                  src={comment.authorImgUrl}
                  alt={comment.authorName}
                  width={36}
                  height={36}
                  className="rounded-full"
                />
                <div>
                  <p className="font-medium">{comment.authorName}</p>
                  <p className="text-xs text-gray-500">{comment.createdAt}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-500">
                <Flag className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-sm">{comment.content}</p>

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
        ))}
      </div>
    </div>
  );
}
