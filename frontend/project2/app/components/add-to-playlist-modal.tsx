"use client";

import { useState, useEffect } from "react";
import { Plus, FolderPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

interface Playlist {
  id: number;
  title: string;
  description?: string;
}

interface AddToPlaylistModalProps {
  curationId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddToPlaylistModal({
  curationId,
  isOpen,
  onClose,
}: AddToPlaylistModalProps) {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPlaylistForm, setShowNewPlaylistForm] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");

  // 플레이리스트 목록 불러오기
  useEffect(() => {
    if (!isOpen) return;

    async function fetchPlaylists() {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8080/api/v1/playlists", {
          credentials: "include",
        });
        if (!res.ok)
          throw new Error("플레이리스트 목록을 불러오지 못했습니다.");
        const result = await res.json();
        setPlaylists(result.data || []);
      } catch (error) {
        console.error(error);
        toast.error("플레이리스트 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchPlaylists();
  }, [isOpen]);

  // 큐레이션을 선택한 플레이리스트에 추가하는 API 호출
  const handleAddCuration = async () => {
    if (!selectedPlaylistId) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(
        `http://localhost:8080/api/v1/playlists/${selectedPlaylistId}/items/curation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ curationId }),
        }
      );

      if (!res.ok) throw new Error("큐레이션 추가에 실패했습니다.");

      toast.success("큐레이션이 플레이리스트에 추가되었습니다.");
      onClose();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("큐레이션 추가 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 새 플레이리스트 생성 및 큐레이션 추가
  const handleCreateAndAddToPlaylist = async () => {
    if (!newPlaylistTitle.trim()) {
      toast.error("플레이리스트 제목을 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. 새 플레이리스트 생성
      const createRes = await fetch("http://localhost:8080/api/v1/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: newPlaylistTitle,
          description: newPlaylistDescription,
          isPublic: true,
        }),
      });

      if (!createRes.ok) throw new Error("플레이리스트 생성에 실패했습니다.");

      const newPlaylist = await createRes.json();
      const newPlaylistId = newPlaylist.data.id;

      // 2. 생성된 플레이리스트에 큐레이션 추가
      const addRes = await fetch(
        `http://localhost:8080/api/v1/playlists/${newPlaylistId}/items/curation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ curationId }),
        }
      );

      if (!addRes.ok) throw new Error("큐레이션 추가에 실패했습니다.");

      toast.success("새 플레이리스트가 생성되고 큐레이션이 추가되었습니다.");
      onClose();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("플레이리스트 생성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 새 플레이리스트 생성 페이지로 이동
  const goToCreatePlaylist = () => {
    // 현재 URL을 세션 스토리지에 저장하여 생성 후 돌아올 수 있게 함
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "returnAfterPlaylistCreate",
        window.location.pathname
      );
      sessionStorage.setItem("curationToAdd", curationId.toString());
    }
    router.push("/playlists/new");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>플레이리스트에 추가</DialogTitle>
          <DialogDescription>
            이 큐레이션을 추가할 플레이리스트를 선택하거나 새로 만드세요.
          </DialogDescription>
        </DialogHeader>

        {showNewPlaylistForm ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">플레이리스트 제목</Label>
              <Input
                id="title"
                value={newPlaylistTitle}
                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                placeholder="제목을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">설명 (선택사항)</Label>
              <Input
                id="description"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                placeholder="플레이리스트에 대한 설명을 입력하세요"
              />
            </div>
          </div>
        ) : (
          <div className="py-4">
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : playlists.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  아직 플레이리스트가 없습니다.
                </p>
                <Button onClick={() => setShowNewPlaylistForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />새 플레이리스트 만들기
                </Button>
              </div>
            ) : (
              <>
                <RadioGroup
                  value={selectedPlaylistId?.toString()}
                  onValueChange={(value) =>
                    setSelectedPlaylistId(Number(value))
                  }
                >
                  <div className="max-h-[240px] overflow-y-auto space-y-2 pr-2">
                    {playlists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className="flex items-center space-x-2 rounded-md border p-3 hover:bg-accent"
                      >
                        <RadioGroupItem
                          value={playlist.id.toString()}
                          id={`playlist-${playlist.id}`}
                        />
                        <Label
                          htmlFor={`playlist-${playlist.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="font-medium">{playlist.title}</div>
                          {playlist.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {playlist.description}
                            </div>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewPlaylistForm(true)}
                  >
                    <FolderPlus className="mr-2 h-4 w-4" />새 플레이리스트
                    만들기
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          {showNewPlaylistForm ? (
            <>
              <Button
                variant="outline"
                onClick={() => setShowNewPlaylistForm(false)}
                disabled={isSubmitting}
              >
                뒤로
              </Button>
              <Button
                onClick={handleCreateAndAddToPlaylist}
                disabled={isSubmitting || !newPlaylistTitle.trim()}
              >
                {isSubmitting ? "처리 중..." : "생성 및 추가"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                onClick={handleAddCuration}
                disabled={
                  isSubmitting ||
                  selectedPlaylistId === null ||
                  playlists.length === 0
                }
              >
                {isSubmitting ? "추가 중..." : "추가"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
