"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { GripVertical, LinkIcon, ExternalLink } from "lucide-react";

export interface PlaylistItem {
  id: number;
  url: string;
  title: string;
  thumbnailUrl?: string;
  creator?: string;
  description?: string;
  addedAt?: string;
}

export interface PlaylistItemsProps {
  playlistId: number;
  items: PlaylistItem[];
}

export default function PlaylistItems({
  playlistId,
  items,
}: PlaylistItemsProps) {
  const [localItems, setLocalItems] = useState<PlaylistItem[]>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleDragEnd = async (result: DropResult): Promise<void> => {
    if (!result.destination) return;

    const reorderedItems = Array.from(localItems);
    const [movedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, movedItem);
    setLocalItems(reorderedItems);

    const orderedItemIds = reorderedItems.map((item) => item.id);

    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/playlists/${playlistId}/items/order`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderedItemIds),
        }
      );
      if (!response.ok) {
        throw new Error("순서 변경 API 호출 실패");
      }
    } catch (error) {
      console.error("순서 변경 실패:", error);
    }
  };

  return (
    <div className="container mx-auto px-8">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="playlist-items">
          {(provided) => (
            <div
              className="space-y-4"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {localItems.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={String(item.id)}
                  index={index}
                >
                  {(providedDrag) => (
                    <Card
                      ref={providedDrag.innerRef}
                      {...providedDrag.draggableProps}
                      className="w-full"
                    >
                      <div className="flex">
                        {/* 드래그 핸들: 좌측 아이콘 영역 */}
                        <div
                          {...providedDrag.dragHandleProps}
                          className="flex items-center px-2 cursor-grab"
                        >
                          <GripVertical className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <CardHeader>
                            <CardTitle className="flex items-center">
                              <LinkIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {item.title /* 제목 표시 */}
                              </a>
                            </CardTitle>
                            {item.description && (
                              <CardDescription className="mt-1 text-sm text-gray-500">
                                {item.description /* 설명 표시 */}
                              </CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            <div className="flex gap-4">
                              <div className="flex flex-col justify-center">
                                {/* URL 표시 */}
                                <p className="text-sm text-gray-500 break-all">
                                  {item.url}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter>
                            {item.addedAt && (
                              <time className="text-xs text-gray-400">
                                {new Date(item.addedAt).toLocaleDateString(
                                  "ko-KR"
                                )}
                              </time>
                            )}
                          </CardFooter>
                        </div>
                      </div>
                    </Card>
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
