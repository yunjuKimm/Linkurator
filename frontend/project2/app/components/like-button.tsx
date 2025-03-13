"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  playlistId: number;
  initialLikes: number;
  size?: "default" | "sm";
  onUnlike?: () => void;
}

export default function LikeButton({
  playlistId,
  initialLikes,
  size = "default",
  onUnlike,
}: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLikedState() {
      try {
        const res = await fetch(
          `http://localhost:8080/api/v1/playlists/${playlistId}/like-status`
        );
        const data = await res.json();
        setIsLiked(data.isLiked);
      } catch (error) {
        console.error("좋아요 상태 불러오기 실패", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLikedState();
  }, [playlistId]);

  const handleToggleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/playlists/${playlistId}/likes`,
        {
          method: isLiked ? "DELETE" : "POST",
        }
      );

      if (!response.ok) {
        throw new Error("좋아요 요청 실패");
      }

      setIsLiked((prev) => !prev);
      setLikes((prev) => (isLiked ? prev - 1 : prev + 1));

      if (isLiked && onUnlike) {
        onUnlike();
      }
    } catch (error) {
      console.error("좋아요 요청 처리 실패", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (size === "sm") {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleToggleLike();
        }}
        className={`flex items-center gap-1 text-xs ${
          isLiked ? "text-rose-500" : "text-muted-foreground"
        }`}
      >
        <Heart className={`h-4 w-4 ${isLiked ? "fill-rose-500" : ""}`} />
        <span>{likes.toLocaleString()}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleLike}
      className={`flex items-center gap-1 px-2 py-1 border rounded ${
        isLiked
          ? "border-rose-500 text-rose-500"
          : "border-gray-300 text-muted-foreground"
      }`}
      disabled={isLoading}
    >
      <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500" : ""}`} />
      <span>{likes.toLocaleString()}</span>
    </button>
  );
}
