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

  // useEffect 수정 - 전역 이벤트 리스너 추가
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

        // 좋아요 상태 확인 - 캐시 방지 헤더 추가
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

    // 다른 컴포넌트에서 발생한 좋아요 상태 변경 이벤트 처리
    const handleLikeChanged = (event: CustomEvent) => {
      const {
        playlistId: changedPlaylistId,
        isLiked: changedIsLiked,
        likeCount: changedLikeCount,
      } = event.detail;

      // 현재 컴포넌트의 플레이리스트 ID와 일치하는 경우에만 상태 업데이트
      if (changedPlaylistId === playlistId) {
        setIsLiked(changedIsLiked);
        setLikes(changedLikeCount);
      }
    };

    window.addEventListener(
      "playlist-like-changed",
      handleLikeChanged as EventListener
    );

    return () => {
      window.removeEventListener(
        "playlist-like-changed",
        handleLikeChanged as EventListener
      );
    };
  }, [playlistId, initialLikes]);

  // 좋아요 상태 변경 시 전역 이벤트 발생 추가
  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    // 로그인 상태 확인 - sessionStorage에서 먼저 확인
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
      const newLikeStatus = !isLiked;

      if (isLiked) {
        // 좋아요 취소
        await unlikePlaylist(playlistId);
        setLikes((prev) => prev - 1);
        setIsLiked(false); // 즉시 상태 업데이트

        // 좋아요 취소 시 콜백 호출
        if (onUnlike) {
          onUnlike();
        }

        toast({
          title: "좋아요가 취소되었습니다",
        });
      } else {
        // 좋아요 추가
        await likePlaylist(playlistId);
        setLikes((prev) => prev + 1);
        setIsLiked(true); // 즉시 상태 업데이트

        toast({
          title: "좋아요가 추가되었습니다",
        });
      }

      // 세션 스토리지에 좋아요 상태 직접 업데이트
      sessionStorage.setItem(
        `playlist_like_${playlistId}`,
        newLikeStatus.toString()
      );

      // 전역 이벤트 발생 - 다른 컴포넌트에 좋아요 상태 변경을 알림
      window.dispatchEvent(
        new CustomEvent("playlist-like-changed", {
          detail: {
            playlistId,
            isLiked: newLikeStatus,
            likeCount: newLikeStatus ? likes + 1 : likes - 1,
          },
        })
      );
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
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

    return (
      <button
        onClick={handleToggleLike}
        disabled={isLoading || !isLoggedIn}
        className={`flex items-center gap-1 text-xs ${
          isLiked
            ? "text-rose-500"
            : isLoggedIn
            ? "text-muted-foreground hover:text-rose-500"
            : "text-muted-foreground opacity-60"
        } transition-colors`}
      >
        <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-rose-500" : ""}`} />
        <span>{likes.toLocaleString()}</span>
      </button>
    );
  }

  // 기본 버튼 렌더링 부분
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

  return (
    <Button
      variant="outline"
      size="sm"
      className={`gap-2 ${isLiked ? "text-rose-500" : ""} ${
        !isLoggedIn ? "opacity-70" : ""
      }`}
      onClick={handleToggleLike}
      disabled={isLoading || !isLoggedIn}
    >
      <Heart className={`h-4 w-4 ${isLiked ? "fill-rose-500" : ""}`} />
      <span>{likes.toLocaleString()}</span>
    </Button>
  );
}
