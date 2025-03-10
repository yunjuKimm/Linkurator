"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, PlusCircle } from "lucide-react";
import { getPlaylists } from "@/lib/playlist-service"; // API 호출 함수
import type { Playlist } from "@/types/playlist";

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        const data = await getPlaylists();
        setPlaylists(data);
      } catch (error) {
        console.error("플레이리스트 로딩 오류:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaylists();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">내 플레이리스트</h1>
          <p className="text-muted-foreground mt-1">
            나만의 링크 큐레이션을 관리하세요.
          </p>
        </div>
        <Link href="/playlists/new">
          <button className="flex items-center px-4 py-2 border rounded hover:bg-gray-100">
            <PlusCircle className="mr-2 h-4 w-4" /> 새 플레이리스트
          </button>
        </Link>
      </div>

      {/* 플레이리스트가 없으면 */}
      {playlists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg">아직 플레이리스트가 없습니다.</p>
          <Link href="/playlists/new">
            <button className="mt-4 px-4 py-2 border rounded hover:bg-gray-100">
              새 플레이리스트 생성
            </button>
          </Link>
        </div>
      ) : (
        // 플레이리스트 목록 그리드
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
            >
              {/* 썸네일 영역 (클릭 시 상세페이지로 이동) */}
              <Link href={`/playlists/${playlist.id}`}>
                <div className="relative aspect-video bg-gray-100">
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
              </Link>
              {/* 플레이리스트 정보 영역 */}
              <div className="p-4">
                <Link href={`/playlists/${playlist.id}`}>
                  <h2 className="font-bold text-lg">{playlist.title}</h2>
                </Link>
                <p className="text-sm text-gray-500">
                  {new Date(playlist.createdAt).toLocaleDateString("ko-KR")}
                </p>
                {/* 액션 버튼: 플레이리스트 수정, 링크 추가 */}
                <div className="mt-4 flex justify-between">
                  <Link href={`/playlists/${playlist.id}/edit`}>
                    <button className="text-sm text-blue-600 hover:underline">
                      수정
                    </button>
                  </Link>
                  <Link href={`/playlists/${playlist.id}/items/link`}>
                    <button className="text-sm text-green-600 hover:underline">
                      링크 추가
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
