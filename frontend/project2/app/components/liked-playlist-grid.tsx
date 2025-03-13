"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Heart, LinkIcon } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Playlist } from "@/types/playlist";

interface LikedPlaylistGridProps {
  playlists: Playlist[];
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

interface LikedPlaylistGridProps {
  playlists: Playlist[];
}

export default function LikedPlaylistGrid({
  playlists,
}: LikedPlaylistGridProps) {
  const [likedPlaylists, setLikedPlaylists] = useState(playlists);

  if (!likedPlaylists.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          아직 좋아요한 플레이리스트가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {likedPlaylists.map((playlist) => (
        <Card key={playlist.id} className="hover:shadow-md transition-shadow">
          <Link href={`/playlists/${playlist.id}`}>
            <CardContent className="p-4">
              <h3 className="text-lg font-bold truncate">{playlist.title}</h3>

              {playlist.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {playlist.description}
                </p>
              )}

              <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{playlist.viewCount || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-rose-500" />
                  <span>{playlist.likeCount || 0}</span>
                </div>
                <Badge variant="outline" className="ml-2">
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
