"use client"

import PlaylistGrid from "@/app/components/playlist-grid";
import Link from "next/link";

export default function PlaylistsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">플레이리스트</h1>
        <Link href="/playlists/new">
          <button className="px-4 py-2 border rounded hover:bg-gray-100">
            새 플레이리스트 생성
          </button>
        </Link>
      </header>
      <PlaylistGrid />
    </div>
  )
}

