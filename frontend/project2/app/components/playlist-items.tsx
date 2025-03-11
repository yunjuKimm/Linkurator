"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

export interface PlaylistItem {
  id: number;
  url: string;
  title: string;
  thumbnailUrl?: string;
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

  if (!localItems || localItems.length === 0) {
    return <p>플레이리스트 항목이 없습니다.</p>;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="playlist-items">
        {(provided) => (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
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
                  <div
                    ref={providedDrag.innerRef}
                    {...providedDrag.draggableProps}
                    {...providedDrag.dragHandleProps}
                    className="border rounded-lg overflow-hidden hover:shadow-md bg-white"
                  >
                    <div className="relative aspect-video bg-gray-100">
                      {item.thumbnailUrl ? (
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-gray-500 break-all">
                        {item.url}
                      </p>
                      {item.addedAt && (
                        <time className="text-xs text-gray-400">
                          {new Date(item.addedAt).toLocaleDateString("ko-KR")}
                        </time>
                      )}
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
  );
}
