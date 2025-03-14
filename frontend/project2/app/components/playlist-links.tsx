"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Clock,
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

interface PlaylistLinksProps {
  playlistId: number;
  links: PlaylistItem[];
}

export default function PlaylistLinks({
  playlistId,
  links: initialLinks,
}: PlaylistLinksProps) {
  const router = useRouter();
  const [links, setLinks] = useState(initialLinks);

  const handleDelete = async (linkId: number) => {
    if (window.confirm("이 링크를 플레이리스트에서 삭제하시겠습니까?")) {
      try {
        await deletePlaylistItem(playlistId, linkId);
        setLinks(links.filter((link) => link.id !== linkId));
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

    const reorderedLinks = Array.from(links);
    const [removed] = reorderedLinks.splice(startIndex, 1);
    reorderedLinks.splice(endIndex, 0, removed);

    setLinks(reorderedLinks);

    try {
      await updatePlaylistItemOrder(
        playlistId,
        reorderedLinks.map((link) => link.id)
      );
    } catch (error) {
      console.error("Failed to reorder links:", error);
      setLinks(initialLinks);
    }
  };

  const getLinkTypeIcon = (url: string) => {
    if (url.includes("pdf")) {
      return <FileText className="h-4 w-4" />;
    }
    return <LinkIcon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">링크 목록</h2>
        <AddLinkButton playlistId={playlistId} />
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="playlist-links">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {links.map((link, index) => (
                <Draggable
                  key={String(link.id)}
                  draggableId={String(link.id)}
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
                            {getLinkTypeIcon(link.url)}
                          </Badge>
                          <h3 className="font-medium line-clamp-1">
                            {link.title}
                          </h3>
                        </div>

                        {link.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {link.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span className="truncate max-w-[200px]">
                              {link.url}
                            </span>
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hidden group-hover:flex"
                          asChild
                        >
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            방문하기
                          </a>
                        </Button>

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
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                새 탭에서 열기
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(link.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              삭제하기
                            </DropdownMenuItem>
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
