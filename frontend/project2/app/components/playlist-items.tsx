"use client";

import Image from "next/image";

export interface PlaylistItem {
  id: number;
  url: string;
  title: string;
  thumbnailUrl?: string;
}

interface PlaylistItemsProps {
  playlistId: number;
  items: PlaylistItem[];
}

export default function PlaylistItems({
  playlistId,
  items,
}: PlaylistItemsProps) {
  if (!items || items.length === 0) {
    return <p>플레이리스트 항목이 없습니다.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="border rounded-lg overflow-hidden hover:shadow-md"
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
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-medium line-clamp-1">{item.title}</h3>
            <p className="text-sm text-muted-foreground break-all">
              {item.url}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
