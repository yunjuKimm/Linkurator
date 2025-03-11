import type { Playlist, PlaylistItem, LinkData } from "@/types/playlist";

// 전체 플레이리스트 조회 (GET /api/v1/playlists)
export async function getPlaylists(): Promise<Playlist[]> {
  const response = await fetch("http://localhost:8080/api/v1/playlists", {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("플레이리스트 데이터를 불러오지 못했습니다.");
  }
  const result = await response.json();
  return result.data;
}

// id에 해당하는 플레이리스트 조회 (GET /api/v1/playlists/{id})
export async function getPlaylistById(id: number): Promise<Playlist> {
  const response = await fetch(`http://localhost:8080/api/v1/playlists/${id}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("플레이리스트 데이터를 불러오지 못했습니다.");
  }
  const result = await response.json();
  return result.data;
}

// 플레이리스트 생성 (POST /api/v1/playlists)
export async function createPlaylist(data: {
  title: string;
  description: string;
  isPublic: boolean;
  thumbnailUrl?: string;
}): Promise<Playlist> {
  const response = await fetch("http://localhost:8080/api/v1/playlists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error("플레이리스트 생성 에러:", errorText);
    throw new Error("플레이리스트 생성 실패");
  }
  const result = await response.json();
  return result.data;
}

// 플레이리스트 수정 (PATCH /api/v1/playlists/{id})
export async function updatePlaylist(
  id: number,
  data: { title: string; description: string; thumbnailUrl?: string }
): Promise<Playlist> {
  const response = await fetch(`http://localhost:8080/api/v1/playlists/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("플레이리스트 수정 실패");
  }
  const result = await response.json();
  return result.data;
}

// 플레이리스트에 링크(항목) 추가 (POST /api/v1/playlists/{id}/items/link)
export async function addItemToPlaylist(
  playlistId: number,
  itemData: LinkData
): Promise<Playlist> {
  const response = await fetch(
    `http://localhost:8080/api/v1/playlists/${playlistId}/items/link`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemData),
    }
  );
  if (!response.ok) {
    throw new Error("플레이리스트에 항목 추가 실패");
  }
  const result = await response.json();
  return result.data;
}

// 플레이리스트 아이템 삭제 (DELETE /api/v1/playlists/{id}/items/{itemId})
export async function deletePlaylistItem(
  playlistId: number,
  itemId: number
): Promise<void> {
  const response = await fetch(
    `http://localhost:8080/api/v1/playlists/${playlistId}/items/${itemId}`,
    { method: "DELETE" }
  );
  if (!response.ok) {
    throw new Error("플레이리스트 아이템 삭제 실패");
  }
}

// 플레이리스트 아이템 순서 변경 (PATCH /api/v1/playlists/{id}/items/order)
export async function updatePlaylistItemOrder(
  playlistId: number,
  orderedItemIds: number[]
): Promise<Playlist> {
  const response = await fetch(
    `http://localhost:8080/api/v1/playlists/${playlistId}/items/order`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderedItemIds),
    }
  );
  if (!response.ok) {
    throw new Error("플레이리스트 아이템 순서 변경 실패");
  }
  const result = await response.json();
  return result.data;
}

// 플레이리스트 추천 (GET /api/v1/playlists/{id}/recommendation)
export async function recommendPlaylist(
  playlistId: number
): Promise<Playlist[]> {
  const response = await fetch(
    `http://localhost:8080/api/v1/playlists/${playlistId}/recommendation`
  );
  if (!response.ok) {
    throw new Error("추천 플레이리스트 조회 실패");
  }
  const result = await response.json();
  return result.data;
}
