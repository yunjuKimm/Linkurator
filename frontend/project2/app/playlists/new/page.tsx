"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PlaylistForm from "@/app/components/playlist-form";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function NewPlaylistPage() {
  const router = useRouter();
  const [returnPath, setReturnPath] = useState<string | null>(null);
  const [curationToAdd, setCurationToAdd] = useState<string | null>(null);

  useEffect(() => {
    // 세션 스토리지에서 돌아갈 경로와 추가할 큐레이션 ID 가져오기
    if (typeof window !== "undefined") {
      const path = sessionStorage.getItem("returnAfterPlaylistCreate");
      const curationId = sessionStorage.getItem("curationToAdd");

      setReturnPath(path);
      setCurationToAdd(curationId);

      // 한 번 사용한 후 세션 스토리지에서 제거
      if (path) sessionStorage.removeItem("returnAfterPlaylistCreate");
      if (curationId) sessionStorage.removeItem("curationToAdd");
    }
  }, []);

  // 플레이리스트 생성 후 큐레이션 추가 처리
  const handlePlaylistCreated = async (playlistId: number) => {
    if (curationToAdd) {
      try {
        // 큐레이션을 새 플레이리스트에 추가
        const res = await fetch(
          `http://localhost:8080/api/v1/playlists/${playlistId}/items/curation`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              curationId: Number.parseInt(curationToAdd),
            }),
          }
        );

        if (!res.ok) throw new Error("큐레이션 추가에 실패했습니다.");

        toast.success("큐레이션이 새 플레이리스트에 추가되었습니다.");

        // 원래 페이지로 돌아가기
        if (returnPath) {
          router.push(returnPath);
          return;
        }
      } catch (error) {
        console.error("큐레이션 추가 중 오류:", error);
        toast.error("큐레이션 추가에 실패했습니다.");
      }
    }

    // 큐레이션 추가가 없거나 실패한 경우 기본 경로로 이동
    router.push(`/playlists/${playlistId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-4">
        <Link
          href={returnPath || "/playlists"}
          className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {returnPath
            ? "이전 페이지로 돌아가기"
            : "플레이리스트 목록으로 돌아가기"}
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">새 플레이리스트 생성</h1>
      <PlaylistForm onPlaylistCreated={handlePlaylistCreated} />
    </div>
  );
}
