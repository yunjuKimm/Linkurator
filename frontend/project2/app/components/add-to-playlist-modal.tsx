"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface Playlist {
  id: number
  title: string
}

interface AddToPlaylistModalProps {
  curationId: number // 현재 큐레이션의 ID
  onClose: () => void
}

export default function AddToPlaylistModal({ curationId, onClose }: AddToPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // 플레이리스트 목록 불러오기
  useEffect(() => {
    async function fetchPlaylists() {
      try {
        const res = await fetch("http://localhost:8080/api/v1/playlists", {
          cache: "no-store",
        })
        if (!res.ok) throw new Error("플레이리스트 목록을 불러오지 못했습니다.")
        const result = await res.json()
        setPlaylists(result.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchPlaylists()
  }, [])

  // 큐레이션을 선택한 플레이리스트에 추가하는 API 호출
  const handleAddCuration = async () => {
    if (!selectedPlaylistId) return
    try {
      const res = await fetch(`http://localhost:8080/api/v1/playlists/${selectedPlaylistId}/items/curation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curationId }),
      })
      if (!res.ok) throw new Error("큐레이션 추가에 실패했습니다.")
      alert("큐레이션이 성공적으로 추가되었습니다.")
      onClose()
    } catch (error) {
      console.error(error)
      alert("큐레이션 추가 중 오류가 발생했습니다.")
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">플레이리스트에 큐레이션 추가</h2>
          <button onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>
        {loading ? (
          <p>플레이리스트 로딩 중...</p>
        ) : playlists.length === 0 ? (
          <p>등록된 플레이리스트가 없습니다.</p>
        ) : (
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {playlists.map((pl) => (
              <li key={pl.id}>
                <label className="flex items-center space-x-2">
                  <input type="radio" name="playlist" value={pl.id} onChange={() => setSelectedPlaylistId(pl.id)} />
                  <span>{pl.title}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            취소
          </button>
          <button onClick={handleAddCuration} className="px-4 py-2 bg-blue-600 text-white rounded">
            추가
          </button>
        </div>
      </div>
    </div>
  )
}

