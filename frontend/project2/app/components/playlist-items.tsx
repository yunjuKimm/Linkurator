"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  ExternalLink,
  FileText,
  GripVertical,
  LinkIcon,
  MoreVertical,
  Trash2,
  ChevronDown,
  ChevronRight,
  BookOpen,
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

// 중첩된 드래그 앤 드롭을 위한 인터페이스 정의
interface DraggableItem {
  id: string; // 드래그 앤 드롭을 위한 고유 ID
  type: "group" | "single"; // 그룹인지 개별 링크인지 구분
  groupKey?: string; // 그룹인 경우 그룹 키
  item: PlaylistItem; // 실제 아이템 데이터
}

// 큐레이션 그룹 인터페이스 정의
interface CurationGroup {
  header: PlaylistItem;
  links: PlaylistItem[];
}

export default function PlaylistItems({
  playlistId,
  items: initialItems,
  isOwner = false,
}: PlaylistItemsProps) {
  const router = useRouter();
  const [items, setItems] = useState<PlaylistItem[]>(initialItems || []);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );
  const [curationGroups, setCurationGroups] = useState<
    Record<string, CurationGroup>
  >({});
  const [singleItems, setSingleItems] = useState<PlaylistItem[]>([]);
  const [draggableItems, setDraggableItems] = useState<DraggableItem[]>([]);

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

  // 전체 평탄한 배열(flat order)을 생성하는 헬퍼 함수
  const getFlatOrder = (
    draggables: DraggableItem[],
    groups: Record<string, CurationGroup>
  ) => {
    const orderedItemIds: number[] = [];
    draggables.forEach((draggable) => {
      if (draggable.type === "group") {
        // 그룹 헤더
        orderedItemIds.push(draggable.item.id);
        const groupKey = draggable.groupKey!;
        // 그룹에 속한 모든 자식 링크 추가 (이미 displayOrder 기준 정렬됨)
        if (groups[groupKey] && groups[groupKey].links) {
          groups[groupKey].links.forEach((link) =>
            orderedItemIds.push(link.id)
          );
        }
      } else {
        orderedItemIds.push(draggable.item.id);
      }
    });
    return orderedItemIds;
  };

  // 메인 및 그룹 드래그 앤 드롭 핸들러
  const handleDragEnd = async (result: any) => {
    const { source, destination, type } = result;

    // 드롭 위치가 없거나 같은 위치에 드롭한 경우
    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    ) {
      return;
    }

    // 메인 리스트에서의 드래그 앤 드롭 (그룹과 단일 아이템의 순서 변경)
    if (type === "MAIN_LIST") {
      const newDraggableItems = Array.from(draggableItems);
      const [removed] = newDraggableItems.splice(source.index, 1);
      newDraggableItems.splice(destination.index, 0, removed);
      setDraggableItems(newDraggableItems);

      const flatOrder = getFlatOrder(newDraggableItems, curationGroups);
      try {
        await updatePlaylistItemOrder(playlistId, flatOrder);
      } catch (error) {
        console.error("Failed to reorder items:", error);
      }
    }
    // 그룹 내부 링크 목록에서의 드래그 앤 드롭
    else if (type.startsWith("GROUP_")) {
      const groupKey = type.replace("GROUP_", "");
      const group = { ...curationGroups[groupKey] };
      const newLinks = Array.from(group.links);
      const [removed] = newLinks.splice(source.index, 1);
      newLinks.splice(destination.index, 0, removed);

      const newCurationGroups = {
        ...curationGroups,
        [groupKey]: { ...group, links: newLinks },
      };
      setCurationGroups(newCurationGroups);

      // 메인 리스트는 그대로이므로, 업데이트된 그룹 정보를 반영해 전체 평탄한 배열 생성
      const flatOrder = getFlatOrder(draggableItems, newCurationGroups);
      try {
        await updatePlaylistItemOrder(playlistId, flatOrder);
      } catch (error) {
        console.error("Failed to reorder group links:", error);
      }
    }
  };

  const getLinkTypeIcon = (url: string | undefined) => {
    if (!url) return <LinkIcon className="h-4 w-4" />;
    if (url.includes("pdf")) {
      return <FileText className="h-4 w-4" />;
    }
    if (url.includes("/curation/")) {
      return <BookOpen className="h-4 w-4" />;
    }
    return <LinkIcon className="h-4 w-4" />;
  };

  // 큐레이션 그룹 토글 함수
  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // 아이템 분류 및 초기화
  useEffect(() => {
    const groups: Record<string, CurationGroup> = {};
    const singles: PlaylistItem[] = [];

    // 1. 먼저 큐레이션 헤더를 식별하고 그룹으로 분류
    items.forEach((item) => {
      if (
        item.title?.startsWith("[큐레이션]") &&
        item.url?.includes("/curation/")
      ) {
        const curationId = item.url.split("/").pop() || "unknown";
        const groupKey = `curation-${curationId}`;

        if (!groups[groupKey]) {
          groups[groupKey] = {
            header: item,
            links: [],
          };
        }
      }
    });

    // 2. 모든 아이템을 순회하며 큐레이션에 속하는 링크 식별
    items.forEach((item) => {
      // 이미 헤더로 식별된 아이템은 건너뜀
      if (
        item.title?.startsWith("[큐레이션]") &&
        item.url?.includes("/curation/")
      ) {
        return;
      }

      let foundGroup = false;
      for (const [groupKey, group] of Object.entries(groups)) {
        const curationId = group.header.url.split("/").pop() || "";
        if (
          (item.url && item.url.includes(curationId)) ||
          (item.description &&
            (item.description.includes(`[큐레이션ID:${curationId}]`) ||
              item.description.includes(group.header.title))) ||
          Math.abs(item.displayOrder - group.header.displayOrder) <= 10
        ) {
          groups[groupKey].links.push(item);
          foundGroup = true;
          break;
        }
      }
      if (!foundGroup) {
        singles.push(item);
      }
    });

    // 3. 각 그룹 내의 링크를 displayOrder 기준으로 정렬
    Object.keys(groups).forEach((key) => {
      groups[key].links.sort((a, b) => a.displayOrder - b.displayOrder);
    });

    setCurationGroups(groups);
    setSingleItems(singles);

    // 4. 기본적으로 모든 그룹을 확장된 상태로 설정
    const initialExpandedState: Record<string, boolean> = {};
    Object.keys(groups).forEach((groupKey) => {
      initialExpandedState[groupKey] = true;
    });
    setExpandedGroups(initialExpandedState);

    // 5. 드래그 가능한 아이템 목록 생성 (그룹 헤더와 단일 링크 포함)
    const newDraggableItems: DraggableItem[] = [];

    Object.entries(groups).forEach(([groupKey, group]) => {
      newDraggableItems.push({
        id: `group-${group.header.id}`,
        type: "group",
        groupKey,
        item: group.header,
      });
    });

    singles.forEach((item) => {
      newDraggableItems.push({
        id: `single-${item.id}`,
        type: "single",
        item,
      });
    });

    newDraggableItems.sort((a, b) => a.item.displayOrder - b.item.displayOrder);
    setDraggableItems(newDraggableItems);
  }, [items]);

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
        <Droppable droppableId="main-list" type="MAIN_LIST">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {draggableItems.map((draggableItem, index) => {
                if (draggableItem.type === "group") {
                  const groupKey = draggableItem.groupKey!;
                  const group = curationGroups[groupKey];
                  const isExpanded = expandedGroups[groupKey] || false;

                  return (
                    <Draggable
                      key={draggableItem.id}
                      draggableId={draggableItem.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="mb-4"
                        >
                          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-md border border-blue-200 hover:bg-blue-100 group">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab text-muted-foreground"
                            >
                              <GripVertical className="h-5 w-5" />
                            </div>

                            <button
                              onClick={() => toggleGroup(groupKey)}
                              className="p-1 rounded-full hover:bg-blue-200"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="flex items-center gap-1 bg-white"
                                >
                                  <BookOpen className="h-4 w-4" />
                                </Badge>
                                <h3 className="font-medium line-clamp-1">
                                  {group.header.title}
                                </h3>
                                <Badge variant="outline" className="ml-2">
                                  {group.links.length} 링크
                                </Badge>
                              </div>

                              {group.header.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {group.header.description}
                                </p>
                              )}

                              <div className="overflow-x-auto">
                                <a
                                  href={group.header.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-gray-500 underline hover:text-gray-700 flex items-center gap-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  <span className="truncate max-w-[300px]">
                                    큐레이션 보기
                                  </span>
                                </a>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex"
                                asChild
                              >
                                <a
                                  href={group.header.url}
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
                                      href={group.header.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      새 탭에서 열기
                                    </a>
                                  </DropdownMenuItem>
                                  {isOwner && (
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onClick={() =>
                                        handleDelete(group.header.id)
                                      }
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      삭제하기
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {isExpanded && group.links.length > 0 && (
                            <Droppable
                              droppableId={`group-${groupKey}`}
                              type={`GROUP_${groupKey}`}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className="pl-8 mt-2 space-y-2"
                                >
                                  {group.links.map((item, itemIndex) => (
                                    <Draggable
                                      key={`group-item-${item.id}`}
                                      draggableId={`group-item-${item.id}`}
                                      index={itemIndex}
                                    >
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          className="flex items-center gap-3 p-4 bg-card rounded-md border hover:bg-accent/50 group ml-4"
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
                                                {item.description.replace(
                                                  /\s*\[큐레이션ID:\d+\]\s*/g,
                                                  ""
                                                )}
                                              </p>
                                            )}

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

                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-8 w-8"
                                                >
                                                  <MoreVertical className="h-4 w-4" />
                                                  <span className="sr-only">
                                                    메뉴
                                                  </span>
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
                                                    onClick={() =>
                                                      handleDelete(item.id)
                                                    }
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
                          )}
                        </div>
                      )}
                    </Draggable>
                  );
                } else {
                  // 개별 링크 렌더링
                  const item = draggableItem.item;
                  return (
                    <Draggable
                      key={draggableItem.id}
                      draggableId={draggableItem.id}
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
                  );
                }
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
