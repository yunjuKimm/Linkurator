"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  Heart,
  LinkIcon,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Playlist } from "@/types/playlist";

// 정렬 옵션 타입
type SortOption = "latest" | "popular" | "mostLiked";

// Workaround for TypeScript errors
const CustomButton = Button as any;
const CustomBadge = Badge as any;

export default function ExplorePlaylists() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(
    null
  );
  const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    minLinks: 0,
    maxLinks: 100,
    minLikes: 0,
  });

  // 모든 플레이리스트 가져오기
  useEffect(() => {
    async function fetchPlaylists() {
      try {
        setIsLoading(true);
        const res = await fetch("http://localhost:8080/api/v1/playlists", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("플레이리스트 데이터를 불러오지 못했습니다.");
        }

        const result = await res.json();
        setPlaylists(result.data);
      } catch (error) {
        console.error("플레이리스트 로딩 오류", error);
        setError((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlaylists();
  }, []);

  // 사용자의 플레이리스트 가져오기 (다른 플레이리스트에 추가하기 위해)
  useEffect(() => {
    async function fetchUserPlaylists() {
      try {
        // 여기서는 모든 플레이리스트를 가져오지만, 실제로는 사용자의 플레이리스트만 가져와야 함
        // 백엔드에 사용자의 플레이리스트만 가져오는 API가 있다면 그것을 사용
        const res = await fetch("http://localhost:8080/api/v1/playlists", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("사용자 플레이리스트를 불러오지 못했습니다.");
        }

        const result = await res.json();
        setUserPlaylists(result.data);
      } catch (error) {
        console.error("사용자 플레이리스트 로딩 오류", error);
      }
    }

    fetchUserPlaylists();
  }, []);

  // 플레이리스트를 사용자의 플레이리스트에 추가
  const addToMyPlaylist = async (targetPlaylistId: number) => {
    if (!selectedPlaylistId) return;

    try {
      setIsAddingToPlaylist(true);

      // 여기서는 큐레이션 추가 API를 사용하지만, 실제로는 플레이리스트 추가 API가 필요할 수 있음
      const response = await fetch(
        `http://localhost:8080/api/v1/playlists/${targetPlaylistId}/items/curation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ curationId: selectedPlaylistId }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("플레이리스트 추가에 실패했습니다.");
      }

      toast.success("플레이리스트가 성공적으로 추가되었습니다.");
      setSelectedPlaylistId(null);
    } catch (error) {
      console.error("플레이리스트 추가 오류:", error);
      toast.error((error as Error).message);
    } finally {
      setIsAddingToPlaylist(false);
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "유효하지 않은 날짜";
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}년 ${month}월 ${day}일`;
  };

  // 검색 및 필터링된 플레이리스트
  const filteredPlaylists = playlists
    .filter(
      (playlist) =>
        playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (playlist.items?.length || 0) >= filterOptions.minLinks &&
        (playlist.items?.length || 0) <= filterOptions.maxLinks &&
        (playlist.likeCount || 0) >= filterOptions.minLikes
    )
    .sort((a, b) => {
      if (sortBy === "latest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortBy === "popular") {
        return (b.viewCount || 0) - (a.viewCount || 0);
      } else if (sortBy === "mostLiked") {
        return (b.likeCount || 0) - (a.likeCount || 0);
      }
      return 0;
    });

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">플레이리스트 탐색</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
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
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">오류 발생!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">플레이리스트 탐색</h1>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="플레이리스트 검색..."
              className="pl-8"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
            />
          </div>

          <div className="flex gap-2">
            <CustomButton
              variant="outline"
              size="icon"
              onClick={() => setShowFilterDialog(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </CustomButton>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <CustomButton variant="outline" size="sm" className="gap-1">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  {sortBy === "latest"
                    ? "최신순"
                    : sortBy === "popular"
                    ? "인기순"
                    : "좋아요순"}
                </CustomButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("latest")}>
                  최신순
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("popular")}>
                  인기순 (조회수)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("mostLiked")}>
                  좋아요순
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {filteredPlaylists.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg border">
          <LinkIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">
            플레이리스트를 찾을 수 없습니다
          </h3>
          <p className="mt-2 text-muted-foreground">
            검색 조건을 변경하거나 필터를 초기화해보세요.
          </p>
          <CustomButton
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchQuery("");
              setFilterOptions({
                minLinks: 0,
                maxLinks: 100,
                minLikes: 0,
              });
              setSortBy("latest");
            }}
          >
            필터 초기화
          </CustomButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPlaylists.map((playlist) => (
            <Card
              key={playlist.id}
              className="relative hover:shadow-md transition-shadow"
            >
              <Link href={`/playlists/${playlist.id}`}>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg truncate">
                    {playlist.title}
                  </h3>

                  {playlist.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {playlist.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{playlist.viewCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{playlist.likeCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <LinkIcon className="w-4 h-4" />
                      <span>{playlist.items?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="px-4 py-2 bg-muted/10 border-t flex justify-between items-center text-xs text-muted-foreground">
                  <span>
                    {playlist.createdAt
                      ? formatDate(playlist.createdAt)
                      : "날짜 정보 없음"}
                  </span>

                  <Dialog>
                    <DialogTrigger
                      asChild
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedPlaylistId(playlist.id);
                      }}
                    >
                      <CustomButton
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />내 플레이리스트에
                        추가
                      </CustomButton>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>내 플레이리스트에 추가</DialogTitle>
                        <DialogDescription>
                          이 플레이리스트를 추가할 내 플레이리스트를 선택하세요.
                        </DialogDescription>
                      </DialogHeader>

                      {userPlaylists.length === 0 ? (
                        <div className="py-6 text-center">
                          <p className="text-muted-foreground mb-4">
                            아직 플레이리스트가 없습니다.
                          </p>
                          <CustomButton
                            onClick={() => router.push("/playlists/new")}
                          >
                            새 플레이리스트 만들기
                          </CustomButton>
                        </div>
                      ) : (
                        <div className="grid gap-4 py-4 max-h-[300px] overflow-y-auto">
                          {userPlaylists.map((userPlaylist) => (
                            <div
                              key={userPlaylist.id}
                              className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                              onClick={() => addToMyPlaylist(userPlaylist.id)}
                            >
                              <div>
                                <h4 className="font-medium">
                                  {userPlaylist.title}
                                </h4>
                                {userPlaylist.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {userPlaylist.description}
                                  </p>
                                )}
                              </div>
                              <CustomBadge variant="outline">
                                {userPlaylist.items?.length || 0} 링크
                              </CustomBadge>
                            </div>
                          ))}
                        </div>
                      )}

                      <DialogFooter>
                        <CustomButton
                          variant="outline"
                          onClick={() => setSelectedPlaylistId(null)}
                        >
                          취소
                        </CustomButton>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* 필터 다이얼로그 */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>플레이리스트 필터링</DialogTitle>
            <DialogDescription>
              원하는 조건으로 플레이리스트를 필터링하세요.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">링크 수</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="최소"
                  min="0"
                  value={filterOptions.minLinks}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFilterOptions({
                      ...filterOptions,
                      minLinks: Number.parseInt(e.target.value) || 0,
                    })
                  }
                />
                <span>~</span>
                <Input
                  type="number"
                  placeholder="최대"
                  min="0"
                  value={filterOptions.maxLinks}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFilterOptions({
                      ...filterOptions,
                      maxLinks: Number.parseInt(e.target.value) || 100,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">최소 좋아요 수</label>
              <Input
                type="number"
                placeholder="최소 좋아요 수"
                min="0"
                value={filterOptions.minLikes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFilterOptions({
                    ...filterOptions,
                    minLikes: Number.parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">정렬 기준</label>
              <Select
                value={sortBy}
                onValueChange={(value: string) =>
                  setSortBy(value as SortOption)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="정렬 기준 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">최신순</SelectItem>
                  <SelectItem value="popular">인기순 (조회수)</SelectItem>
                  <SelectItem value="mostLiked">좋아요순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <CustomButton
              variant="outline"
              onClick={() => {
                setFilterOptions({
                  minLinks: 0,
                  maxLinks: 100,
                  minLikes: 0,
                });
                setSortBy("latest");
              }}
            >
              초기화
            </CustomButton>
            <CustomButton onClick={() => setShowFilterDialog(false)}>
              적용하기
            </CustomButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
