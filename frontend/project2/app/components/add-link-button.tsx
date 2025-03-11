"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AddLinkButtonProps {
  playlistId: number;
}

export default function AddLinkButton({ playlistId }: AddLinkButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");

  const handleSubmit = async () => {
    if (!url.trim()) return;
    try {
      const response = await fetch(
        `/api/v1/playlists/${playlistId}/items/link`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // BE API에 맞게 전달할 데이터 형식 조정 (예: { url: url } 혹은 { linkId: url } 등)
          body: JSON.stringify({ url }),
        }
      );
      if (!response.ok) {
        throw new Error("링크 추가에 실패했습니다.");
      }
      alert("링크가 성공적으로 추가되었습니다.");
      // 필요 시 페이지 새로고침 또는 상태 업데이트 로직 추가
      setUrl("");
      setShowForm(false);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div>
      {showForm ? (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="border rounded p-2"
          />
          <Button onClick={handleSubmit}>저장</Button>
          <Button onClick={() => setShowForm(false)}>취소</Button>
        </div>
      ) : (
        <Button onClick={() => setShowForm(true)}>링크 추가</Button>
      )}
    </div>
  );
}
