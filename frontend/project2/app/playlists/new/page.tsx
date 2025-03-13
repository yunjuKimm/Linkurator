import Link from "next/link"
import PlaylistForm from "@/app/components/playlist-form"
import { ArrowLeft } from "lucide-react"

export default function NewPlaylistPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-4">
        <Link href="/playlists" className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600">
          <ArrowLeft className="mr-2 h-4 w-4" />
          플레이리스트 목록으로 돌아가기
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">새 플레이리스트 생성</h1>
      <PlaylistForm />
    </div>
  )
}

