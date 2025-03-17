import type { Playlist } from "@/types/playlist";

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

// 플레이리스트 가져오기 함수 수정
export async function getPlaylistById(id: number): Promise<Playlist> {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

  const response = await fetch(`http://localhost:8080/api/v1/playlists/${id}`, {
    cache: "no-store",
    ...(isLoggedIn ? { credentials: "include" } : {}),
  });

  if (!response.ok) {
    throw new Error("플레이리스트 데이터를 불러오지 못했습니다.");
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
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    throw new Error("로그인이 필요합니다.");
  }

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

// 플레이리스트 아이템 편집 함수 추가
export async function updatePlaylistItem(
  playlistId: number,
  itemId: number,
  data: {
    title?: string;
    url?: string;
    description?: string;
  }
): Promise<Playlist> {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetch(
    `http://localhost:8080/api/v1/playlists/${playlistId}/items/${itemId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("플레이리스트 아이템 수정에 실패했습니다.");
  }

  const result = await response.json();
  return result.data;
}

// 플레이리스트 아이템 순서 변경 함수 수정
export async function updatePlaylistItemOrder(
  playlistId: number,
  orderUpdates: { id: number; children?: number[] }[]
): Promise<Playlist> {
  console.log("서버에 전송할 순서 업데이트:", orderUpdates);

  try {
    const response = await fetch(
      `http://localhost:8080/api/v1/playlists/${playlistId}/items/order`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        credentials: "include",
        body: JSON.stringify(orderUpdates),
      }
    );

    if (!response.ok) {
      throw new Error("플레이리스트 아이템 순서 변경에 실패했습니다.");
    }

    const result = await response.json();
    console.log("서버 응답 (순서 변경):", result);

    // 응답에서 아이템 목록의 displayOrder 값 확인
    if (result.data && result.data.items) {
      // 서버에서 받은 아이템을 displayOrder로 정렬하여 로깅
      const sortedItems = [...result.data.items].sort(
        (a: any, b: any) => a.displayOrder - b.displayOrder
      );
      console.log(
        "서버 응답에서 받은 아이템 displayOrder 정렬 순서:",
        sortedItems.map((item: any) => ({
          id: item.id,
          title: item.title,
          displayOrder: item.displayOrder,
        }))
      );

      // 정렬된 아이템으로 결과 반환
      return {
        ...result.data,
        items: sortedItems,
      };
    }

    return result.data;
  } catch (error) {
    console.error("순서 변경 API 호출 오류:", error);
    throw error;
  }
}

// 추천 플레이���스트 가져오기
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

// 좋아요한 플레이리스트 목록 가져오기
export async function getLikedPlaylists(): Promise<Playlist[]> {
  try {
    const response = await fetch(
      "http://localhost:8080/api/v1/playlists/liked",
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("좋아요한 플레이리스트를 불러오지 못했습니다.");
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("좋아요한 플레이리스트 조회 오류:", error);
    throw error;
  }
}

// 플레이리스트 좋아요 수 가져오기 함수 수정 - 캐시 방지 강화
export async function getPlaylistLikeCount(
  playlistId: number
): Promise<number> {
  try {
    // 현재 타임스탬프를 쿼리 파라미터로 추가하여 캐시 방지
    const timestamp = new Date().getTime();

    const response = await fetch(
      `http://localhost:8080/api/v1/playlists/${playlistId}/like/count?_t=${timestamp}`,
      {
        credentials: "include",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );

    if (!response.ok) {
      throw new Error("좋아요 수 조회 실패");
    }

    const data = await response.json();
    return data.data || 0; // 데이터가 없는 경우 0 반환
  } catch (error) {
    console.error("좋아요 수 조회 오류:", error);
    // 에러 발생 시 초기값 사용
    return 0;
  }
}

// 플레이리스트 좋아요 상태 확인 함수 수정 - 캐시 방지 강화
export async function getPlaylistLikeStatus(
  playlistId: number
): Promise<boolean> {
  try {
    // 강제 새로고침 파라미터가 있는 경우 캐시 무시
    const forceRefresh = sessionStorage.getItem(
      `force_refresh_like_${playlistId}`
    );

    // 세션 스토리지에서 먼저 확인 (캐싱)
    const cachedStatus = sessionStorage.getItem(`playlist_like_${playlistId}`);
    if (cachedStatus !== null && forceRefresh !== "true") {
      return cachedStatus === "true";
    }

    // 강제 새로고침 플래그 제거
    if (forceRefresh === "true") {
      sessionStorage.removeItem(`force_refresh_like_${playlistId}`);
    }

    // 현재 타임스탬프를 쿼리 파라미터로 추가하여 캐시 방지
    const timestamp = new Date().getTime();

    const response = await fetch(
      `http://localhost:8080/api/v1/playlists/${playlistId}/like/status?_t=${timestamp}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );

    if (!response.ok) {
      // 401 에러는 로그인이 필요한 경우이므로 false 반환
      if (response.status === 401) {
        return false;
      }
      throw new Error("좋아요 상태 조회 실패");
    }

    const data = await response.json();
    const likeStatus = data.data;

    // 세션 스토리지에 상태 저장 (캐싱)
    sessionStorage.setItem(
      `playlist_like_${playlistId}`,
      likeStatus.toString()
    );

    return likeStatus;
  } catch (error) {
    console.error("좋아요 상태 조회 오류:", error);
    return false;
  }
}

// 플레이리스트 좋아요 추가 함수 수정 - 캐시 방지 강화
export async function likePlaylist(playlistId: number): Promise<void> {
  const response = await fetch(
    `http://localhost:8080/api/v1/playlists/${playlistId}/like`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("좋아요 추가 실패");
  }

  // 좋아요 상태 캐시 업데이트
  sessionStorage.setItem(`playlist_like_${playlistId}`, "true");

  // 강제 새로고침 플래그 설정
  sessionStorage.setItem(`force_refresh_like_${playlistId}`, "true");
}

// 플레이리스트 좋아요 취소 함수 수정 - 캐시 방지 강화
export async function unlikePlaylist(playlistId: number): Promise<void> {
  const response = await fetch(
    `http://localhost:8080/api/v1/playlists/${playlistId}/like`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("좋아요 취소 실패");
  }

  // 좋아요 상태 캐시 업데이트
  sessionStorage.setItem(`playlist_like_${playlistId}`, "false");

  // 강제 새로고침 플래그 설정
  sessionStorage.setItem(`force_refresh_like_${playlistId}`, "true");
}

// 로그인 상태 확인
export async function checkLoginStatus(): Promise<boolean> {
  try {
    // 세션 스토리지에서 로그인 상태 확인
    const savedLoginStatus = sessionStorage.getItem("isLoggedIn");

    if (savedLoginStatus === "true") {
      return true;
    }

    const response = await fetch("http://localhost:8080/api/v1/members/me", {
      credentials: "include",
    });

    if (response.ok) {
      sessionStorage.setItem("isLoggedIn", "true");
      return true;
    } else {
      sessionStorage.removeItem("isLoggedIn");
      return false;
    }
  } catch (error) {
    console.error("로그인 상태 확인 오류:", error);
    sessionStorage.removeItem("isLoggedIn");
    return false;
  }
}
