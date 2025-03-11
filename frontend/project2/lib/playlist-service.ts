import type { Playlist } from "@/types/playlist";

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

export async function getPlaylistById(id: number | string): Promise<Playlist> {
  const response = await fetch(`http://localhost:8080/api/v1/playlists/${id}`, {
    cache: "no-store",
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

export async function updatePlaylist(
  id: number,
  data: {
    title: string;
    description: string;
    thumbnailUrl?: string;
  }
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
