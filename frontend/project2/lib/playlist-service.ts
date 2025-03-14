import type { Playlist, LinkData } from "@/types/playlist";

// 플레이리스트 생성
export async function createPlaylist(data: {
  title: string;
  description?: string;
  isPublic?: boolean;
}): Promise<Playlist> {
  const response = await fetch("http://localhost:8080/api/v1/playlists", {
    cache: "no-store",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
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
    throw new Error("플레이리스트 생성에 실패했습니다.");
  }

  const result = await response.json();
  return result.data;
}

export async function updatePlaylist(
  id: number,
  data: {
    title?: string;
    description?: string;
    isPublic?: boolean;
  }
): Promise<Playlist> {
  const response = await fetch(`http://localhost:8080/api/v1/playlists/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("플레이리스트 수정에 실패했습니다.");
  }

  const result = await response.json();
  return result.data;
}

// 플레이리스트 아이템 추가
export async function addItemToPlaylist(
  playlistId: number,
  item: {
    title: string;
    url: string;
    description?: string;
  }
): Promise<Playlist> {
  const response = await fetch(
    `http://localhost:8080/api/v1/playlists/${playlistId}/items/link`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("플레이리스트에 아이템 추가에 실패했습니다.");
  }

  const result = await response.json();

  // 업데이트된 플레이리스트 데이터 가져오기
  const updatedPlaylist = await getPlaylistById(playlistId);
  return updatedPlaylist;
}

// 플레이리스트 아이템 삭제
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
    throw new Error("플레이리스트 아이템 삭제에 실패했습니다.");
  }
}

// 플레이리스트 아이템 순서 변경
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
    throw new Error("플레이리스트 아이템 순서 변경에 실패했습니다.");
  }

  const result = await response.json();
  return result.data;
}

// 추천 플레이리스트 가져오기
export async function recommendPlaylist(
  playlistId: number,
  sortType = "combined"
): Promise<Playlist[]> {
  try {
    const response = await fetch(
      `http://localhost:8080/api/v1/playlists/${playlistId}/recommendation?sortType=${sortType}`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("추천 플레이리스트 조회에 실패했습니다.");
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("추천 플레이리스트 조회 오류:", error);
    return [];
  }
}

// 모든 플레이리스트 가져오기
export async function getAllPlaylists(): Promise<Playlist[]> {
  try {
    const response = await fetch("http://localhost:8080/api/v1/playlists", {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("플레이리스트 목록 조회에 실패했습니다.");
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("플레이리스트 목록 조회 오류:", error);
    return [];
  }
}
