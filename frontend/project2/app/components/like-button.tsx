"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface LikeButtonProps {
  playlistId: number;
  initialLikes: number;
  size?: "sm" | "default";
  onUnlike?: () => void;
}

export default function LikeButton({
  playlistId,
  initialLikes,
  size = "default",
  onUnlike,
}: LikeButtonProps) {
  const { toast } = useToast();
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLikedState() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/v1/playlists/${playlistId}/like/status`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!res.ok) {
          // 401 에러는 로그인이 필요한 경우이므로 조용히 처리
          if (res.status !== 401) {
            throw new Error("좋아요 상태 조회 실패");
          }
          return;
        }

        const data = await res.json();
        setIsLiked(data.data);

        const countRes = await fetch(
          `http://localhost:8080/api/v1/playlists/${playlistId}/like/count`
        );
        if (countRes.ok) {
          const countData = await countRes.json();
          setLikes(countData.data);
        }
      } catch (error) {
        console.error("좋아요 상태 불러오기 실패", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLikedState();
  }, [playlistId]);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    // 로그인 상태 확인
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      toast({
        title: "로그인이 필요합니다",
        description: "좋아요 기능을 사용하려면 로그인해주세요.",
        variant: "destructive",
      });

      // 현재 URL을 저장하고 로그인 페이지로 이동
      sessionStorage.setItem("loginRedirectPath", window.location.pathname);
      window.location.href = "/auth/login";
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/playlists/${playlistId}/like`,
        {
          method: isLiked ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("좋아요 요청 실패");
      }

      // 좋아요 상태 업데이트
      setIsLiked((prev) => !prev);
      setLikes((prev) => (isLiked ? prev - 1 : prev + 1));

      // 좋아요 취소 시 콜백 호출
      if (isLiked && onUnlike) {
        onUnlike();
      }

      // 토스트 메시지 표시
      toast({
        title: isLiked ? "좋아요가 취소되었습니다" : "좋아요가 추가되었습니다",
        duration: 2000,
      });
    } catch (error) {
      console.error("좋아요 요청 처리 실패", error);
      toast({
        title: "오류 발생",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (size === "sm") {
    return (
      <button
        onClick={handleToggleLike}
        disabled={isLoading}
        className={`flex items-center gap-1 text-xs ${
          isLiked
            ? "text-rose-500"
            : "text-muted-foreground hover:text-rose-500"
        } transition-colors`}
      >
        <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-rose-500" : ""}`} />
        <span>{likes.toLocaleString()}</span>
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={`gap-2 ${isLiked ? "text-rose-500" : ""}`}
      onClick={handleToggleLike}
      disabled={isLoading}
    >
      <Heart className={`h-4 w-4 ${isLiked ? "fill-rose-500" : ""}`} />
      <span>{likes.toLocaleString()}</span>
    </Button>
  );
}
