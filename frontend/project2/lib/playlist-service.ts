import type { Playlist, LinkData } from "@/types/playlist";

export async function getPlaylists(): Promise<Playlist[]> {
  const response = await fetch("http://localhost:8080/api/v1/playlists", {
    cache: "no-store",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("플레이리스트 데이터를 불러오지 못했습니다.");
  }
  const result = await response.json();
  return result.data;
}

export async function getPlaylistById(id: number): Promise<Playlist> {
  const response = await fetch(`http://localhost:8080/api/v1/playlists/${id}`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("플레이리스트 데이터를 불러오지 못했습니다.");
  }
  const result = await response.json();
  return result.data;
}

export async function createPlaylist(data: {
  title: string;
  description: string;
  isPublic: boolean;
  thumbnailUrl?: string;
}): Promise<Playlist> {
  const response = await fetch("http://localhost:8080/api/v1/playlists", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
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

export async function updatePlaylist(
  id: number,
  data: {
    title: string;
    description: string;
    isPublic: boolean;
    thumbnailUrl?: string;
  }
): Promise<Playlist> {
  const response = await fetch(`http://localhost:8080/api/v1/playlists/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("플레이리스트 수정 실패");
  }
  const result = await response.json();
  return result.data;
}

// addItemToPlaylist 함수가 추가된 아이템을 포함한 전체 플레이리스트를 반환하도록 수정
export async function addItemToPlaylist(
  playlistId: number,
  itemData: LinkData
): Promise<Playlist> {
  const response = await fetch(
    `http://localhost:8080/api/v1/playlists/${playlistId}/items/link`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(itemData),
    }
  );
  if (!response.ok) {
    throw new Error("플레이리스트에 항목 추가 실패");
  }
  const result = await response.json();

  // 업데이트된 플레이리스트 데이터 가져오기
  const updatedPlaylist = await getPlaylistById(playlistId);
  return updatedPlaylist;
}

export async function deletePlaylistItem(
  playlistId: number,
  itemId: number
): Promise<void> {
  const response = await fetch(
    `http://localhost:8080/api/v1/playlists/${playlistId}/items/${itemId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("플레이리스트 아이템 삭제 실패");
  }
}

export async function updatePlaylistItemOrder(
  playlistId: number,
  orderedItemIds: number[]
): Promise<Playlist> {
  const response = await fetch(
    `http://localhost:8080/api/v1/playlists/${playlistId}/items/order`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(orderedItemIds),
    }
  );
  if (!response.ok) {
    throw new Error("플레이리스트 아이템 순서 변경 실패");
  }
  const result = await response.json();
  return result.data;
}

export async function recommendPlaylist(
  playlistId: number
): Promise<Playlist[]> {
  const response = await fetch(
    `http://localhost:8080/api/v1/playlists/${playlistId}/recommendation`,
    {
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("추천 플레이리스트 조회 실패");
  }
  const result = await response.json();
  return result.data;
}
