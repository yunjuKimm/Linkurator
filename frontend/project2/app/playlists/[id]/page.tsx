
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bookmark, Edit, Eye, LinkIcon, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getPlaylistById, recommendPlaylist } from "@/lib/playlist-service";
import AddLinkButton from "@/app/components/add-link-button";
import PlaylistItems from "@/app/components/playlist-items";
import LikeButton from "@/app/components/like-button";
import type { Playlist } from "@/types/playlist";

export default async function PlaylistDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const playlist = await getPlaylistById(Number(params.id));
  if (!playlist) {
    notFound();
  }

  const recommendedPlaylists: Playlist[] = await recommendPlaylist(
    Number(params.id)
  );

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 메인 플레이리스트 영역 */}
        <div className="lg:col-span-3">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {playlist.title}
                  </h1>
                  {playlist.tags &&
                    Array.isArray(playlist.tags) &&
                    playlist.tags.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {playlist.tags.join(", ")}
                      </Badge>
                    )}
                </div>
                {playlist.description && (
                  <p className="text-muted-foreground mt-2 max-w-2xl">
                    {playlist.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-start">
                <LikeButton
                  playlistId={playlist.id}
                  initialLikes={playlist.likeCount}
                />
                <AddLinkButton playlistId={playlist.id} />
                <Link href={`/playlists/${playlist.id}/edit`}>
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">편집</span>
                  </Button>
                </Link>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">공유</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Bookmark className="h-4 w-4 mr-1" />
                <span>
                  {new Date(playlist.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  생성
                </span>
              </div>
              <div className="flex items-center">
                <LinkIcon className="h-4 w-4 mr-1" />
                <span>{playlist.items?.length || 0}개 링크</span>
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>{playlist.viewCount.toLocaleString()} 조회</span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

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

        {/* 추천 플레이리스트 사이드바 */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-lg font-semibold mb-4">추천 플레이리스트</h3>
            {recommendedPlaylists.length > 0 ? (
              <div className="space-y-4">
                {recommendedPlaylists.map((rec: Playlist) => (
                  <Card
                    key={rec.id}
                    className="overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <Link href={`/playlists/${rec.id}`}>
                      <CardContent className="p-4">
                        <h4 className="font-medium line-clamp-1">
                          {rec.title}
                        </h4>
                        {rec.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {rec.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <LinkIcon className="h-3 w-3" />
                            <span>{rec.items?.length || 0}</span>
                          </div>
                          <LikeButton
                            playlistId={rec.id}
                            initialLikes={rec.likeCount}
                            size="sm"
                          />
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                추천할 플레이리스트가 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

