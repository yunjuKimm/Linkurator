"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Heart, MessageSquare, Bookmark, Share2, LinkIcon } from "lucide-react";
import CurationSkeleton from "@/app/components/skeleton/curation-skeleton";
import { stripHtml } from "@/lib/htmlutils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Curation 데이터 인터페이스 정의
interface Curation {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  modifiedAt: string;
  likeCount: number;
  commentCount: number;
  urls: {
    url: string;
    title: string;
    description: string;
    imageUrl: string;
    id?: number;
    click?: number; // Add click count
  }[];
  tags: { name: string }[];
  viewCount?: number;
  authorName: string;
  memberImgUrl: string;
}

// API 응답 인터페이스 정의
interface ApiResponse {
  code: string;
  msg: string;
  data: Curation[];
}

// API URL 상수
const API_URL = "http://localhost:8080";
const PAGE_SIZE = 20;

export default function FollowingCurations() {
  const [curations, setCurations] = useState<Curation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // API 요청 함수
  const fetchFollowingCurations = async (pageNum = 0, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      console.log(`Fetching following curations page ${pageNum}`);

      const response = await fetch(
        `${API_URL}/api/v1/curation/following?page=${pageNum}&size=${PAGE_SIZE}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          "팔로우 중인 큐레이터의 큐레이션을 불러오지 못했습니다."
        );
      }

      const data = (await response.json()) as ApiResponse;
      if (data && data.data) {
        // API 응답에서 큐레이션 배열 직접 추출
        const newCurations = data.data;

        console.log(`Received ${newCurations.length} curations`);

        // 더 불러올 데이터가 있는지 확인 (받은 데이터가 PAGE_SIZE보다 적으면 더 이상 없음)
        setHasMore(newCurations.length === PAGE_SIZE);

        if (isLoadMore) {
          setCurations((prev) => [...prev, ...newCurations]);
        } else {
          setCurations(newCurations);
        }
      } else {
        console.error("No data found in the response");
        if (!isLoadMore) {
          setCurations([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching following curations:", error);
      setError((error as Error).message);
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        // 스켈레톤 UI가 잠시 보이도록 약간의 지연 추가 (실제 환경에서는 제거 가능)
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    }
  };

  // 더 불러오기 함수
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      console.log(`Loading more: page ${nextPage}`);
      setPage(nextPage);
      fetchFollowingCurations(nextPage, true);
    }
  }, [page, loadingMore, hasMore]);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    if (loadingMore || !hasMore) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const buffer = 100; // 하단에서 100px 위에 도달하면 로드

    if (scrollPosition >= documentHeight - buffer) {
      console.log("Reached bottom of page, loading more...");
      loadMore();
    }
  }, [loadMore, loadingMore, hasMore]);

  // 좋아요 추가 API 호출 함수
  const likeCuration = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/curation/${id}`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to like the post");
      }

      // 좋아요를 추가한 후, 좋아요 카운트만 업데이트
      setCurations((prev) =>
        prev.map((curation) =>
          curation.id === id
            ? { ...curation, likeCount: curation.likeCount + 1 }
            : curation
        )
      );
    } catch (error) {
      console.error("Error liking the post:", error);
    }
  };

  // 링크 클릭 처리 함수
  const handleLinkClick = async (url: string, linkId?: number) => {
    if (!linkId && !url) return;

    try {
      // 링크 클릭 시 백엔드에 조회수 증가 요청
      const response = await fetch(`${API_URL}/api/v1/link/${linkId}`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Link click recorded:", result);
        // 여기서 필요하다면 UI 업데이트 가능
      }
    } catch (error) {
      console.error("링크 클릭 처리 중 오류:", error);
    }

    // 링크 클릭 후 새 탭에서 URL 열기
    window.open(url, "_blank");
  };

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

  // 초기 데이터 로드
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchFollowingCurations(0);
  }, []);

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <>
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
            <p>팔로우 중인 큐레이터의 글이 없습니다.</p>
          ) : (
            <>
              {curations.map((curation) => (
                <div key={curation.id} className="space-y-4 border-b pb-6">
                  {/* 작성자 정보 추가 */}
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={curation.memberImgUrl}
                        alt={curation.authorName}
                      />
                      <AvatarFallback>
                        {curation.authorName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {curation.authorName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(curation.createdAt)}
                      </p>
                    </div>
                    {curation.viewCount !== undefined && (
                      <p className="text-xs text-gray-500 ml-auto">
                        조회수 {curation.viewCount}
                      </p>
                    )}
                  </div>

                  <div>
                    <Link href={`/curation/${curation.id}`} className="group">
                      <h2 className="text-xl font-bold group-hover:text-blue-600">
                        {curation.title}
                      </h2>
                    </Link>
                    <p className="mt-2 text-gray-600">
                      {curation.content ? stripHtml(curation.content, 100) : ""}
                    </p>
                    <button className="mt-2 text-sm font-medium text-blue-600">
                      더보기
                    </button>
                  </div>

                  {/* 태그 표시 */}
                  <div className="flex flex-wrap space-x-2 mt-2">
                    {curation.tags.map((tag, index) => (
                      <span
                        key={`${tag.name}-${index}`}
                        className="px-3 py-1 text-sm font-medium rounded-full bg-gray-200 text-gray-600 mb-2"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>

                  {/* 메타 데이터 카드 */}
                  {curation.urls.map((urlObj, index) => (
                    <div
                      key={`${urlObj.url}-${index}`}
                      onClick={() => handleLinkClick(urlObj.url, urlObj.id)}
                      className="mt-4 rounded-lg border p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {urlObj.imageUrl ? (
                          <img
                            src={
                              urlObj.imageUrl ||
                              "/placeholder.svg?height=48&width=48" ||
                              "/placeholder.svg"
                            }
                            alt="Preview"
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <LinkIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">
                            {urlObj.title || "링크"}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {urlObj.description || urlObj.url}
                          </p>
                          {urlObj.click !== undefined && (
                            <p className="text-xs text-gray-500 mt-1">
                              조회수: {urlObj.click}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        className="flex items-center space-x-1 text-sm text-gray-500"
                        onClick={() => likeCuration(curation.id)}
                      >
                        <Heart className="h-4 w-4" />
                        <span>{curation.likeCount}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-sm text-gray-500">
                        <MessageSquare className="h-4 w-4" />
                        <span>{curation.commentCount || 0}</span>
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
              ))}

              {/* 더 불러오기 로딩 표시 */}
              <div ref={loadMoreRef} className="py-4 text-center">
                {loadingMore ? (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span className="ml-2">불러오는 중...</span>
                  </div>
                ) : hasMore ? (
                  <p className="text-sm text-gray-500">
                    스크롤하여 더 불러오기
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">더 이상 글이 없습니다</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
