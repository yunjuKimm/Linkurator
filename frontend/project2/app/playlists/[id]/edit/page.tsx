import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PlaylistForm from "@/app/components/playlist-form";
import { getPlaylistById } from "@/lib/playlist-service";

export default async function EditPlaylistPage({
  params,
}: {
  params: { id: string };
}) {
  const playlist = await getPlaylistById(Number(params.id));
  if (!playlist) {
    notFound();
  }

  return (
    <div className="container py-6 max-w-2xl mx-auto">
      <div className="mb-4">
        <Link
          href={`/playlists/${playlist.id}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          플레이리스트로 돌아가기
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">플레이리스트 편집</h1>
        <p className="text-muted-foreground mt-2">
          플레이리스트 정보를 수정합니다.
        </p>
      </div>

      <PlaylistForm playlist={playlist} />
    </div>
  );
}
