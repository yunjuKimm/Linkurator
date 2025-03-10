"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";

interface Playlist {
  id: number;
  title: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export default function PlaylistGrid() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        const res = await fetch("http://localhost:8080/api/v1/playlists", {
          cache: "no-store",
        });
        if (!res.ok)
          throw new Error("플레이리스트 데이터를 불러오지 못했습니다.");
        const result = await res.json();
        setPlaylists(result.data);
      } catch (error) {
        console.error("플레이리스트 로딩 오류:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlaylists();
  }, []);

  if (isLoading) {
    return <div className="text-center py-12">로딩 중...</div>;
  }

  if (!playlists.length) {
    return (
      <div className="text-center py-12">
        <p className="text-lg">아직 플레이리스트가 없습니다.</p>
        <Link href="/playlists/new">
          <button className="mt-4 px-4 py-2 border rounded hover:bg-gray-100">
            새 플레이리스트 생성
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {playlists.map((playlist) => (
        <Link key={playlist.id} href={`/playlists/${playlist.id}`}>
          <div className="border rounded-lg overflow-hidden hover:shadow-md transition">
            <div className="relative aspect-video bg-muted">
              {playlist.thumbnailUrl ? (
                <Image
                  src={playlist.thumbnailUrl}
                  alt={playlist.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Play className="h-12 w-12 text-gray-500" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium line-clamp-1">{playlist.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(playlist.createdAt).toLocaleDateString("ko-KR")}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
