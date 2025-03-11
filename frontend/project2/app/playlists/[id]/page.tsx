import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bookmark, Edit, LinkIcon, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getPlaylistById } from "@/lib/playlist-service";
import AddLinkButton from "@/app/components/add-link-button";
import PlaylistItems from "@/app/components/playlist-items";

export default async function PlaylistDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const playlist = await getPlaylistById(Number(params.id));
  if (!playlist) {
    notFound();
  }

  return (
    <div className="container py-6 max-w-6xl mx-auto">
      {/* 상단 뒤로가기 링크 */}
      <div className="mb-4">
        <Link
          href="/playlists"
          className="inline-flex items-center text-sm text-muted-foreground hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          플레이리스트 목록으로 돌아가기
        </Link>
      </div>

      {/* 플레이리스트 정보 영역 */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {playlist.title}
              </h1>
              {playlist.tags && (
                <Badge variant="secondary" className="ml-2">
                  {playlist.tags}
                </Badge>
              )}
            </div>
            {playlist.description && (
              <p className="text-muted-foreground mt-2">
                {playlist.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* 링크 추가 버튼 */}
            <AddLinkButton playlistId={playlist.id} />
            <Link href={`/playlists/${playlist.id}/edit`}>
              <Button variant="outline" size="icon">
                <Edit className="mr-2 h-4 w-4" />
                <span className="sr-only">편집</span>
              </Button>
            </Link>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
              <span className="sr-only">공유</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          <div className="flex items-center">
            <Bookmark className="h-4 w-4 mr-1" />
            <span>
              {new Date(playlist.createdAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {"  "}생성
            </span>
          </div>
          <div className="mx-2">•</div>
          <div className="flex items-center">
            <LinkIcon className="h-4 w-4 mr-1" />
            <span>{playlist.items?.length || 0}개 링크</span>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* 하단 플레이리스트 항목 영역 */}
      {playlist.items && playlist.items.length > 0 ? (
        <PlaylistItems playlistId={playlist.id} items={playlist.items} />
      ) : (
        <div className="text-center py-12">
          <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">아직 링크가 없습니다</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            이 플레이리스트에 링크를 추가해보세요.
          </p>
          <AddLinkButton playlistId={playlist.id} />
        </div>
      )}
    </div>
  );
}
