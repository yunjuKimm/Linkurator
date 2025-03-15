"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, LinkIcon } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Playlist } from "@/types/playlist";
import LikeButton from "@/app/components/like-button";
import { Skeleton } from "@/components/ui/skeleton";

interface LikedPlaylistGridProps {
  playlists: Playlist[];
  onLikeStatusChange?: () => void;
  isLoading?: boolean;
}

const formatDate = (dateString: string): string => {
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
};

export default function LikedPlaylistGrid({
  playlists,
  onLikeStatusChange,
  isLoading = false,
}: LikedPlaylistGridProps) {
  const [likedPlaylists, setLikedPlaylists] = useState<Playlist[]>(playlists);

  // props로 받은 플레이리스트가 변경되면 상태 업데이트
  useEffect(() => {
    setLikedPlaylists(playlists);
  }, [playlists]);

  // 좋아요 취소 핸들러
  const handleUnlike = (playlistId: number) => {
    // 로컬 UI 업데이트
    setLikedPlaylists((prev) => prev.filter((p) => p.id !== playlistId));

    // 부모 컴포넌트에 알림
    if (onLikeStatusChange) {
      onLikeStatusChange();
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
            <CardFooter className="px-4 py-2">
              <Skeleton className="h-4 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!likedPlaylists.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          아직 좋아요한 플레이리스트가 없습니다.
        </p>
        <Link
          href="/explore/playlists"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          플레이리스트 탐색하기
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {likedPlaylists.map((playlist) => (
        <Card
          key={playlist.id}
          className="hover:shadow-md transition-shadow relative overflow-hidden"
        >
          {/* 붉은색 상단 라인 추가 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500"></div>

          <Link href={`/playlists/${playlist.id}`}>
            <CardContent className="p-4">
              <h3 className="text-lg font-bold truncate">{playlist.title}</h3>

              <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{playlist.viewCount || 0}</span>
                </div>

                {/* 좋아요 버튼 -> 취소하면 목록에서 제거 */}
                <LikeButton
                  playlistId={playlist.id}
                  initialLikes={playlist.likeCount}
                  onUnlike={() => handleUnlike(playlist.id)}
                  size="sm"
                />

                <Badge variant="outline">
                  <LinkIcon className="w-4 h-4" />
                  <span>{playlist.items?.length || 0}</span>
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="px-4 py-2 bg-muted/10 border-t text-xs text-muted-foreground">
              {playlist.createdAt
                ? formatDate(playlist.createdAt)
                : "날짜 정보 없음"}
            </CardFooter>
          </Link>
        </Card>
      ))}
    </div>
  );
}
