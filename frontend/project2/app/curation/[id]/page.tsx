"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  ArrowLeft,
} from "lucide-react";
import RightSidebar from "@/app/components/right-sidebar";
import CommentSection from "@/app/components/comment-section";

// 큐레이션 데이터 타입
interface CurationData {
  title: string;
  content: string;
  authorName: string;
  authorImage: string;
  createdAt: string;
  modifiedAt: string;
  urls: { url: string }[];
  tags: { name: string }[];
  likes: number;

  comments: { authorName: string; content: string }[]; // 댓글
}

// 큐레이션 데이터 API 호출 함수
async function fetchCurationData(id: string): Promise<CurationData> {
  const res = await fetch(`http://localhost:8080/api/v1/curation/${id}`);
  const data = await res.json();
  return data.data;
}

export default function PostDetail({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<CurationData | null>(null); // 큐레이션 데이터 상태
  const [linkMetaData, setLinkMetaData] = useState<any | null>(null); // 링크 메타 데이터 상태

  // 데이터 fetch 함수
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchCurationData(params.id);
        setPost(data); // 큐레이션 데이터 설정
      } catch (error) {
        console.error("Error fetching curation data:", error);
      }
    }
    fetchData();
  }, [params.id]);

  // 메타 데이터 추출 함수 (링크 메타 데이터)
  const fetchLinkMetaData = async (url: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/link/preview`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: url }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch link metadata");
      }

      const data = await response.json();
      setLinkMetaData(data.data);
    } catch (error) {
      console.error("Error fetching link metadata:", error);
    }
  };

  // 데이터가 로드되지 않았을 때 로딩 상태 처리
  if (!post) {
    return <div>Loading...</div>;
  }

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
    <main className="container grid grid-cols-12 gap-6 px-4 py-6">
      <div className="col-span-9">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Link>
        </div>

        <article className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image
                src={post.authorImage || "/placeholder.svg"}
                alt={post.authorName}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="font-medium">{post.authorName}</p>
                <p className="text-xs text-gray-500">
                  {Math.floor(new Date(post.modifiedAt).getTime() / 1000) !==
                  Math.floor(new Date(post.createdAt).getTime() / 1000)
                    ? `수정된 날짜 : ${formatDate(post.modifiedAt)}`
                    : `작성된 날짜 : ${formatDate(post.createdAt)}`}
                </p>
              </div>
            </div>
            <button className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50">
              팔로우
            </button>
          </div>
          <h1 className="text-3xl font-bold">{post.title}</h1>

          <div className="my-6 rounded-lg border shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
              <div className="flex items-center">
                <div className="mr-4 flex-shrink-0">
                  <Image
                    src={`/placeholder.svg?height=80&width=80`}
                    alt="링크 썸네일"
                    width={80}
                    height={80}
                    className="rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {post.urls?.[0]?.url || "No URL"}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">{post.content}</p>
                  <div className="flex items-center text-sm">
                    <span className="text-blue-600">{post.urls?.[0]?.url}</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-gray-500">바로가기</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            {post.tags.map((tag: { name: string }, index: number) => (
              <span
                key={tag.name}
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  tag.name === "포털"
                    ? "bg-blue-100 text-blue-800"
                    : tag.name === "개발"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                #{tag.name}
              </span>
            ))}
          </div>

          <div
            className="prose prose-sm sm:prose lg:prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="flex items-center justify-between border-t border-b py-4">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-1 text-sm">
                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                <span className="font-medium">{post.likes}</span>
              </button>
              <button className="flex items-center space-x-1 text-sm text-gray-500">
                <MessageSquare className="h-5 w-5" />
                <span>{post.comments?.length || 0}</span>
              </button>
            </div>
            <div className="flex space-x-2">
              <button className="rounded-md border p-2 hover:bg-gray-50">
                <Bookmark className="h-5 w-5 text-gray-500" />
              </button>
              <button className="rounded-md border p-2 hover:bg-gray-50">
                <Share2 className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* 댓글 섹션 */}
          <CommentSection postId={params.id} />
        </article>
      </div>

      <div className="col-span-3">
        <RightSidebar />

        <div className="rounded-lg border p-4">
          <h3 className="mb-3 font-semibold">이 글의 작성자</h3>
          <div className="flex items-center space-x-3">
            <Image
              src={post.authorImage || "/placeholder.svg"}
              alt={post.authorName}
              width={48}
              height={48}
              className="rounded-full"
            />
            <div>
              <p className="font-medium">{post.authorName}</p>
              <p className="text-xs text-gray-500">15개의 글 작성</p>
            </div>
          </div>
          <button className="mt-3 w-full rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50">
            팔로우
          </button>
        </div>
      </div>
    </main>
  );
}
