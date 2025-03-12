"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LinkIcon } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Playlist } from "@/types/playlist";

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

export default function PlaylistGrid() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        const res = await fetch("http://localhost:8080/api/v1/playlists", {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("플레이리스트 데이터를 불러오지 못했습니다.");
        }
        const result = await res.json();
        setPlaylists(result.data);
      } catch (error) {
        console.error("플레이리스트 로딩 실패", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlaylists();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
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

  if (!playlists.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">플레이리스트가 없습니다.</p>
        <Link href="/playlists/new">
          <button className="mt-4 px-4 py-2 border rounded hover:bg-gray-100">
            새 플레이리스트 생성
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {playlists.map((playlist) => (
        <Card key={playlist.id} className="hover:shadow-md transition-shadow">
          <Link href={`/playlists/${playlist.id}`}>
            <CardContent className="p-4">
              <h3 className="font-bold text-lg truncate">{playlist.title}</h3>
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <LinkIcon className="w-4 h-4" />
                <span>{playlist.items?.length || 0}</span>
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
