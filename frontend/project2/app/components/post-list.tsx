"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MessageSquare, Bookmark, Share2 } from "lucide-react";

// Curation 데이터 인터페이스 정의
interface Curation {
  id: number;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  modifiedAt: string;
  likeCount: number;
  urls: { url: string }[]; // URLs 배열 추가
  tags: { name: string }[];
}

// Link 메타 데이터 인터페이스 정의
interface LinkMetaData {
  url: string;
  title: string;
  description: string;
  image: string;
}

type SortOrder = "LATEST" | "LIKECOUNT";

export default function PostList() {
  const [curations, setCurations] = useState<Curation[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("LATEST"); // 기본값: 최신순
  const [loading, setLoading] = useState<boolean>(false);
  const [linkMetaDataList, setLinkMetaDataList] = useState<{ [key: number]: LinkMetaData[] }>({}); // 각 큐레이션에 대한 메타 데이터 상태 (배열로 수정)

  // API 요청 함수
  const fetchCurations = async (order: SortOrder) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/curation?order=${order}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (data && data.data) {
        setCurations(data.data);
      } else {
        console.error("No data found in the response");
      }
    } catch (error) {
      console.error("Error fetching curations:", error);
    } finally {
      setLoading(false);
    }
  };

  // 메타 데이터 추출 함수
  const fetchLinkMetaData = async (url: string, curationId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/link/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "url": url }), // body에 JSON 형태로 URL을 전달
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch link metadata");
      }
  
      const data = await response.json();
      setLinkMetaDataList((prev) => {
        const existingMetaData = prev[curationId] || [];
        // 중복된 메타 데이터가 추가되지 않도록 필터링
        const newMetaData = existingMetaData.filter(
          (meta) => meta.url !== data.data.url // 이미 존재하는 URL은 제외
        );
        return {
          ...prev,
          [curationId]: [...newMetaData, data.data], // 중복 제거 후 메타 데이터 추가
        };
      });
    } catch (error) {
      console.error("Error fetching link metadata:", error);
    }
  };
  

  // 좋아요 추가 API 호출 함수
  const likeCuration = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/curation/${id}`, {
        method: 'POST', // POST 요청으로 좋아요 추가
      });
      if (!response.ok) {
        throw new Error("Failed to like the post");
      }

      // 좋아요를 추가한 후, 데이터를 다시 불러와서 화면 갱신
      fetchCurations(sortOrder);
    } catch (error) {
      console.error("Error liking the post:", error);
    }
  };

  // 정렬 변경 시 API 호출
  useEffect(() => {
    fetchCurations(sortOrder);
  }, [sortOrder]);

  // 큐레이션마다 메타 데이터 추출
  useEffect(() => {
    curations.forEach((curation) => {
      if (curation.urls.length > 0) {
        curation.urls.forEach(urlObj => {
          // URL이 이미 메타 데이터에 포함되지 않았다면 메타 데이터를 가져옴
          if (!linkMetaDataList[curation.id]?.some(meta => meta.url === urlObj.url)) {
            fetchLinkMetaData(urlObj.url, curation.id); // 메타 데이터 가져오기
          }
        });
      }
    });
  }, [curations, linkMetaDataList]); // linkMetaDataList도 의존성에 추가
  
  

  // 날짜 형식화 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
  };

  return (
    <>
      {/* 정렬 버튼 */}
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex h-9 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500">
          <button
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium shadow ${
              sortOrder === "LATEST" ? "bg-white text-black" : "text-gray-500"
            }`}
            onClick={() => setSortOrder("LATEST")}
          >
            최신순
          </button>
          <button
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium shadow ${
              sortOrder === "LIKECOUNT" ? "bg-white text-black" : "text-gray-500"
            }`}
            onClick={() => setSortOrder("LIKECOUNT")}
          >
            좋아요순
          </button>
        </div>
      </div>

      {/* 로딩 상태 표시 */}
      {loading ? <p>데이터를 불러오는 중...</p> : null}

      {/* 게시글 목록 */}
      <div className="space-y-6 pt-4">
        {curations.length === 0 ? (
          <p>글이 없습니다.</p>
        ) : (
          curations.map((curation) => (
            <div key={curation.id} className="space-y-4 border-b pb-6">
              <div className="flex items-center space-x-2">
              <p className="text-xs text-gray-500">
                {
                  `작성된 날짜 : ${formatDate(curation.createdAt)}`
                /* {Math.floor(new Date(curation.modifiedAt).getTime() / 1000) !== Math.floor(new Date(curation.createdAt).getTime() / 1000)
                  ? `수정된 날짜 : ${formatDate(curation.modifiedAt)}`
                  : `작성된 날짜 : ${formatDate(curation.createdAt)}`} */
                  }
              </p>
              </div>

              <div>
                <Link href={`/post/${curation.id}`} className="group">
                  <h2 className="text-xl font-bold group-hover:text-blue-600">
                    {curation.title}
                  </h2>
                </Link>
                <p className="mt-2 text-gray-600">
                  {curation.content.length > 100
                    ? `${curation.content.substring(0, 100)}...`
                    : curation.content}
                </p>
                <button className="mt-2 text-sm font-medium text-blue-600">더보기</button>
              </div>

              {/* 메타 데이터 카드 */}
              {linkMetaDataList[curation.id]?.map((metaData, index) => (
                <Link key={index} href={metaData.url} passHref>
                  <div className="mt-4 rounded-lg border p-4 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <img
                        src={metaData.image}
                        alt="Preview"
                        className="h-12 w-12 rounded-lg"
                      />
                      <div>
                        <h3 className="font-medium">{metaData.title}</h3>
                        <p className="text-sm text-gray-600">
                          {metaData.description}
                        </p>
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
    </>
  );
}
