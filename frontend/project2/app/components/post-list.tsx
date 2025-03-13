"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart, MessageSquare, Bookmark, Share2, AlertCircle } from "lucide-react"
import CurationSkeleton from "./skeleton/curation-skeleton"

// Curation 데이터 인터페이스 정의
interface Curation {
  id: number
  title: string
  content: string
  createdBy: string
  createdAt: string
  modifiedAt: string
  likeCount: number
  urls: { url: string }[] // URLs 배열 추가
  tags: { name: string }[]
}

// Link 메타 데이터 인터페이스 정의
interface LinkMetaData {
  url: string
  title: string
  description: string
  image: string
}

interface CurationRequestParams {
  tags?: string[]
  title?: string
  content?: string
  order?: SortOrder
}

type SortOrder = "LATEST" | "LIKECOUNT"

export default function PostList() {
  const [curations, setCurations] = useState<Curation[]>([])
  const [sortOrder, setSortOrder] = useState<SortOrder>("LATEST") // 기본값: 최신순
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [linkMetaDataList, setLinkMetaDataList] = useState<{
    [key: number]: LinkMetaData[]
  }>({}) // 각 큐레이션에 대한 메타 데이터 상태 (배열로 수정)
  const [filterModalOpen, setFilterModalOpen] = useState(false) // 필터 모달 상태
  const [tags, setTags] = useState<string[]>([]) // 선택된 태그 상태
  const [selectedTags, setSelectedTags] = useState<string[]>([]) // 필터링된 태그 상태
  const [title, setTitle] = useState<string>("") // 제목 필터링
  const [content, setContent] = useState<string>("") // 내용 필터링

  // API 기본 URL 설정
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

  // API 요청 함수
  const fetchCurations = async (params: CurationRequestParams) => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams({
        order: sortOrder, // 기존의 sortOrder 상태를 직접 전달
        ...(params.tags && params.tags.length > 0 ? { tags: params.tags.join(",") } : {}),
        ...(params.title ? { title: params.title } : {}),
        ...(params.content ? { content: params.content } : {}),
      }).toString()

      // 타임아웃 설정
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃

      const response = await fetch(`${API_BASE_URL}/api/v1/curation?${queryParams}`, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      })

      clearTimeout(timeoutId) // 타임아웃 제거

      if (!response.ok) {
        throw new Error(`서버 응답 오류: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      if (data && data.data) {
        setCurations(data.data)
      } else {
        console.warn("응답에 데이터가 없습니다:", data)
        setCurations([])
      }
    } catch (error) {
      console.error("Error fetching curations:", error)

      // 사용자 친화적인 오류 메시지 설정
      if ((error as Error).name === "AbortError") {
        setError("요청 시간이 초과되었습니다. 서버 연결을 확인해주세요.")
      } else if ((error as Error).message.includes("Failed to fetch")) {
        setError("서버에 연결할 수 없습니다. 네트워크 연결 또는 API 서버가 실행 중인지 확인해주세요.")
      } else {
        setError(`큐레이션을 불러오는 중 오류가 발생했습니다: ${(error as Error).message}`)
      }

      // 오류 발생 시 빈 배열 설정
      setCurations([])
    } finally {
      setLoading(false)
    }
  }

  // 필터 버튼 클릭 시
  const openFilterModal = () => {
    setFilterModalOpen(true)
  }

  const closeFilterModal = () => {
    setFilterModalOpen(false)
  }

  // 필터링 조건을 기반으로 API 호출
  const applyFilter = () => {
    setSelectedTags(tags) // 입력한 tags를 selectedTags에 동기화

    const params: CurationRequestParams = {
      tags: selectedTags,
      title,
      content,
      order: sortOrder, // 정렬 기준도 함께 보내기
    }
    fetchCurations(params)
    closeFilterModal()
  }

  // 메타 데이터 추출 함수
  const fetchLinkMetaData = async (url: string, curationId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/link/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url }), // body에 JSON 형태로 URL을 전달
      })

      if (!response.ok) {
        throw new Error("Failed to fetch link metadata")
      }

      const data = await response.json()
      setLinkMetaDataList((prev) => {
        const existingMetaData = prev[curationId] || []
        // 중복된 메타 데이터가 추가되지 않도록 필터링
        const newMetaData = existingMetaData.filter(
          (meta) => meta.url !== data.data.url, // 이미 존재하는 URL은 제외
        )
        return {
          ...prev,
          [curationId]: [...newMetaData, data.data], // 중복 제거 후 메타 데이터 추가
        }
      })
    } catch (error) {
      console.error("Error fetching link metadata:", error)
    }
  }

  // 좋아요 추가 API 호출 함수
  const likeCuration = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/curation/${id}`, {
        method: "POST", // POST 요청으로 좋아요 추가
      })
      if (!response.ok) {
        throw new Error("Failed to like the post")
      }

      // 좋아요를 추가한 후, 데이터를 다시 불러와서 화면 갱신
      const params: CurationRequestParams = {
        tags: selectedTags,
        title,
        content,
        order: sortOrder, // 정렬 기준도 함께 보내기
      }
      fetchCurations(params)
    } catch (error) {
      console.error("Error liking the post:", error)
    }
  }

  // 큐레이션마다 메타 데이터 추출
  useEffect(() => {
    curations.forEach((curation) => {
      if (curation.urls && curation.urls.length > 0) {
        curation.urls.forEach((urlObj) => {
          // URL이 이미 메타 데이터에 포함되지 않았다면 메타 데이터를 가져옴
          if (!linkMetaDataList[curation.id]?.some((meta) => meta.url === urlObj.url)) {
            fetchLinkMetaData(urlObj.url, curation.id) // 메타 데이터 가져오기
          }
        })
      }
    })
  }, [curations, linkMetaDataList]) // linkMetaDataList도 의존성에 추가

  // 날짜 형식화 함수
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "유효하지 않은 날짜"
      }

      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const hours = String(date.getHours()).padStart(2, "0")
      const minutes = String(date.getMinutes()).padStart(2, "0")
      return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`
    } catch (e) {
      console.error("날짜 형식 오류:", e)
      return "날짜 형식 오류"
    }
  }

  useEffect(() => {
    const params: CurationRequestParams = {
      tags: selectedTags,
      title,
      content,
      order: sortOrder, // 정렬 기준도 함께 보내기
    }
    fetchCurations(params)
  }, [selectedTags])

  const toggleTagFilter = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag) // 이미 선택된 태그가 있으면 제거
      }
      return [...prev, tag] // 선택되지 않은 태그가 있으면 추가
    })
  }

  useEffect(() => {
    fetchCurations({}) // 페이지 로딩 시 한번 API 호출
  }, []) // 빈 배열을 의존성으로 두어 처음 한 번만 호출되게 설정

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        {/* 필터링 버튼 */}
        <button
          onClick={openFilterModal}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-3 py-1 text-sm font-medium shadow"
        >
          필터링
        </button>
      </div>

      {/* 필터링 모달 */}
      {filterModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">필터링 조건</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">태그</label>
              <input
                type="text"
                defaultValue={selectedTags.join(", ")}
                onChange={(e) => {
                  // 입력값을 스페이스바가 포함되더라도 정상적으로 처리하도록 수정
                  const inputTags = e.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag !== "") // 빈 태그는 제외
                  setTags(inputTags) // tags 상태 업데이트
                }}
                className="mt-1 p-2 w-full border rounded-md"
                placeholder="태그 입력 (쉼표로 구분)"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 p-2 w-full border rounded-md"
                placeholder="제목 입력"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">내용</label>
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 p-2 w-full border rounded-md"
                placeholder="내용 입력"
              />
            </div>
            {/* 정렬 기준 드롭다운 추가 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">정렬 기준</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)} // value 변경 시 sortOrder 업데이트
                className="mt-1 p-2 w-full border rounded-md"
              >
                <option value="LATEST">최신순</option>
                <option value="LIKECOUNT">좋아요순</option>
              </select>
            </div>
            <div className="flex justify-between">
              <button onClick={applyFilter} className="bg-blue-600 text-white px-4 py-2 rounded-md">
                적용
              </button>
              <button onClick={closeFilterModal} className="bg-gray-300 text-black px-4 py-2 rounded-md">
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 오류 메시지 표시 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-start mb-6">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">데이터를 불러올 수 없습니다</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* 로딩 상태 표시 - 스켈레톤 UI로 대체 */}
      {loading ? (
        <div className="space-y-6 pt-4">
          {[...Array(3)].map((_, index) => (
            <CurationSkeleton key={index} />
          ))}
        </div>
      ) : (
        /* 게시글 목록 */
        <div className="space-y-6 pt-4">
          {curations.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              {error ? "오류로 인해 데이터를 불러올 수 없습니다." : "글이 없습니다."}
            </p>
          ) : (
            curations.map((curation) => (
              <div key={curation.id} className="space-y-4 border-b pb-6">
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-500">{`작성된 날짜 : ${formatDate(curation.createdAt)}`}</p>
                </div>

                <div>
                  <Link href={`/curation/${curation.id}`} className="group">
                    <h2 className="text-xl font-bold group-hover:text-blue-600">{curation.title}</h2>
                  </Link>
                  <p className="mt-2 text-gray-600">
                    {curation.content.length > 100 ? `${curation.content.substring(0, 100)}...` : curation.content}
                  </p>
                  <button className="mt-2 text-sm font-medium text-blue-600">더보기</button>
                </div>

                {/* 태그 표시 */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {curation.tags.map((tag, index) => (
                    <span
                      key={`${tag.name}-${index}`}
                      className={`px-3 py-1 text-sm font-medium rounded-full cursor-pointer ${
                        selectedTags.includes(tag.name) ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                      }`}
                      onClick={() => toggleTagFilter(tag.name)}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>

                {/* 메타 데이터 카드 */}
                {linkMetaDataList[curation.id]?.map((metaData, index) => (
                  <Link key={`${metaData.url}-${index}`} href={metaData.url} passHref>
                    <div className="mt-4 rounded-lg border p-4 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <img
                          src={metaData.image || "/placeholder.svg?height=48&width=48"}
                          alt="Preview"
                          className="h-12 w-12 rounded-lg"
                        />
                        <div>
                          <h3 className="font-medium">{metaData.title}</h3>
                          <p className="text-sm text-gray-600">{metaData.description}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      className="flex items-center space-x-1 text-sm text-gray-500"
                      onClick={() => likeCuration(curation.id)} // 좋아요 버튼 클릭 시 likeCuration 호출
                    >
                      <Heart className="h-4 w-4" />
                      <span>{curation.likeCount}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-sm text-gray-500">
                      <MessageSquare className="h-4 w-4" />
                      <span>12</span>
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button>
                      <Bookmark className="h-4 w-4 text-gray-500" />
                    </button>
                    <button>
                      <Share2 className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  )
}

