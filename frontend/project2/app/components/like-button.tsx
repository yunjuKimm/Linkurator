"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  playlistId: number;
  initialLikes: number;
  onUnlike?: () => void;
}

export default function LikeButton({
  playlistId,
  initialLikes,
  onUnlike,
}: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

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
          throw new Error("좋아요 상태 조회 실패");
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
        setLoading(false);
      }
    }
    fetchLikedState();
  }, [playlistId]);

  const handleToggleLike = async () => {
    if (loading) return;

    setLoading(true);
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

      setIsLiked((prev) => !prev);
      setLikes((prev) => (isLiked ? prev - 1 : prev + 1));

      if (isLiked && onUnlike) {
        onUnlike();
      }
    } catch (error) {
      console.error("좋아요 요청 처리 실패", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggleLike();
      }}
      disabled={loading}
      className={`flex items-center gap-1 ${
        isLiked ? "text-rose-500" : "text-gray-500"
      }`}
    >
      <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500" : ""}`} />
      <span>{likes.toLocaleString()}</span>
    </button>
  );
}
