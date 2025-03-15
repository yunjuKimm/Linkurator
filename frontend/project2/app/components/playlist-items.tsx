"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  ExternalLink,
  FileText,
  GripVertical,
  LinkIcon,
  MoreVertical,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { PlaylistItem } from "@/types/playlist";
import {
  deletePlaylistItem,
  updatePlaylistItemOrder,
} from "@/lib/playlist-service";
import AddLinkButton from "./add-link-button";

// 인터페이스에 isOwner 속성 추가
interface PlaylistItemsProps {
  playlistId: number;
  items: PlaylistItem[];
  isOwner?: boolean;
}

// 함수 매개변수에 isOwner 추가 (기본값 false)
export default function PlaylistItems({
  playlistId,
  items: initialItems,
  isOwner = false,
}: PlaylistItemsProps) {
  const router = useRouter();
  const [items, setItems] = useState<PlaylistItem[]>(initialItems || []);

  // 새 링크가 추가되었을 때 호출되는 함수
  const handleLinkAdded = (newItem: PlaylistItem) => {
    setItems((prevItems) => [...prevItems, newItem]);
  };

  const handleDelete = async (itemId: number) => {
    if (window.confirm("이 링크를 플레이리스트에서 삭제하시겠습니까?")) {
      try {
        await deletePlaylistItem(playlistId, itemId);
        setItems(items.filter((item) => item.id !== itemId));
        router.refresh();
      } catch (error) {
        console.error("Failed to delete link:", error);
      }
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    if (startIndex === endIndex) return;
    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(startIndex, 1);
    reorderedItems.splice(endIndex, 0, removed);
    setItems(reorderedItems);
    try {
      await updatePlaylistItemOrder(
        playlistId,
        reorderedItems.map((item) => item.id)
      );
    } catch (error) {
      console.error("Failed to reorder items:", error);
      setItems(initialItems);
    }
  };

  const getLinkTypeIcon = (url: string | undefined) => {
    if (!url) return <LinkIcon className="h-4 w-4" />;
    if (url.includes("pdf")) {
      return <FileText className="h-4 w-4" />;
    }
    return <LinkIcon className="h-4 w-4" />;
  };

  // 상단 부분 수정 - 링크 추가 버튼을 소유자만 볼 수 있게
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">링크 목록</h2>
        {isOwner && (
          <AddLinkButton
            playlistId={playlistId}
            onLinkAdded={handleLinkAdded}
          />
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="playlist-items">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {items.map((item, index) => (
                <Draggable
                  key={String(item.id)}
                  draggableId={String(item.id)}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center gap-3 p-4 bg-card rounded-md border hover:bg-accent/50 group"
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="cursor-grab text-muted-foreground"
                      >
                        <GripVertical className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            {getLinkTypeIcon(item.url)}
                          </Badge>
                          <h3 className="font-medium line-clamp-1">
                            {item.title}
                          </h3>
                        </div>

                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        {/* URL을 설명 아래에 표시 */}
                        <div className="overflow-x-auto">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 underline hover:text-gray-700 flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span className="truncate max-w-[300px]">
                              {item.url}
                            </span>
                          </a>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground"></div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex"
                          asChild
                        >
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            방문하기
                          </a>
                        </Button>

                        {/* 삭제 버튼 부분 수정 - 소유자만 볼 수 있게 */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">메뉴</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                새 탭에서 열기
                              </a>
                            </DropdownMenuItem>
                            {isOwner && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDelete(item.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                삭제하기
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
