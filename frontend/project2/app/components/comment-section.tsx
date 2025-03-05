"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import { Heart, Flag } from "lucide-react";

type Comment = {
  id: string;
  author: string;
  authorImage: string;
  content: string;
  postedAt: string;
  likes: number;
  isLiked: boolean;
};

export default function CommentSection({ postId }: { postId: string }) {
  // 초기 댓글 데이터
  const initialComments: Comment[] = [
    {
      id: "1",
      author: "이성준",
      authorImage: "/placeholder.svg?height=36&width=36",
      content:
        "정말 유익한 글이네요! 특히 실제 적용 사례 부분이 도움이 많이 되었습니다.",
      postedAt: "3시간 전",
      likes: 8,
      isLiked: false,
    },
    {
      id: "2",
      author: "김하늘",
      authorImage: "/placeholder.svg?height=36&width=36",
      content:
        "좋은 정보 감사합니다. 혹시 관련 자료나 참고할 만한 문서가 더 있을까요?",
      postedAt: "1일 전",
      likes: 5,
      isLiked: false,
    },
    {
      id: "3",
      author: "정민우",
      authorImage: "/placeholder.svg?height=36&width=36",
      content:
        "저도 비슷한 경험이 있는데, 글에서 언급한 방법을 적용하니 정말 효과가 있었습니다. 다음 글도 기대하고 있겠습니다!",
      postedAt: "1일 전",
      likes: 12,
      isLiked: false,
    },
  ];

  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");

  const handleLikeComment = (commentId: string) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            isLiked: !comment.isLiked,
          };
        }
        return comment;
      })
    );
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentObj: Comment = {
      id: `${comments.length + 1}`,
      author: "현재 사용자",
      authorImage: "/placeholder.svg?height=36&width=36",
      content: newComment,
      postedAt: "방금 전",
      likes: 0,
      isLiked: false,
    };

    setComments([newCommentObj, ...comments]);
    setNewComment("");
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
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-lg border p-4">
            <div className="flex justify-between">
              <div className="flex items-center space-x-2">
                <Image
                  src={comment.authorImage || "/placeholder.svg"}
                  alt={comment.author}
                  width={36}
                  height={36}
                  className="rounded-full"
                />
                <div>
                  <p className="font-medium">{comment.author}</p>
                  <p className="text-xs text-gray-500">{comment.postedAt}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-500">
                <Flag className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-sm">{comment.content}</p>

            <div className="mt-3 flex items-center space-x-4">
              <button
                onClick={() => handleLikeComment(comment.id)}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
              >
                <Heart
                  className={`h-4 w-4 ${
                    comment.isLiked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                <span>{comment.likes}</span>
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
