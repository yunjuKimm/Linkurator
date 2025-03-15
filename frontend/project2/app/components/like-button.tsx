"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  getPlaylistLikeStatus,
  getPlaylistLikeCount,
  likePlaylist,
  unlikePlaylist,
  checkLoginStatus,
} from "@/lib/playlist-service";

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
    async function fetchLikeData() {
      try {
        setIsLoading(true);

        // 초기 좋아요 수는 props에서 받은 값으로 설정
        setLikes(initialLikes);

        // 로그인 상태 확인
        const loggedIn = await checkLoginStatus();

        if (!loggedIn) {
          setIsLoading(false);
          return;
        }

        // 좋아요 상태 확인
        const likeStatus = await getPlaylistLikeStatus(playlistId);
        setIsLiked(likeStatus);

        // 좋아요 수 가져오기 - API 호출이 실패하면 initialLikes 유지
        try {
          const likeCount = await getPlaylistLikeCount(playlistId);
          if (likeCount !== undefined && likeCount !== null) {
            setLikes(likeCount);
          }
        } catch (error) {
          console.error("좋아요 수 조회 실패, 초기값 사용:", error);
          // 초기값 유지
        }
      } catch (error) {
        console.error("좋아요 데이터 로딩 실패", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLikeData();
  }, [playlistId, initialLikes]);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    // 로그인 상태 확인
    const isLoggedIn = await checkLoginStatus();
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
      if (isLiked) {
        // 좋아요 취소
        await unlikePlaylist(playlistId);
        setLikes((prev) => prev - 1);

        // 좋아요 취소 시 콜백 호출
        if (onUnlike) {
          onUnlike();
        }

        toast({
          title: "좋아요가 취소되었습니다",
          duration: 2000,
        });
      } else {
        // 좋아요 추가
        await likePlaylist(playlistId);
        setLikes((prev) => prev + 1);

        toast({
          title: "좋아요가 추가되었습니다",
          duration: 2000,
        });
      }

      // 좋아요 상태 업데이트
      setIsLiked((prev) => !prev);
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
