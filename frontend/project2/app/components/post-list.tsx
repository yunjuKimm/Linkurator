'use client'
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MessageSquare, Bookmark, Share2 } from "lucide-react";

// Curation 데이터 인터페이스 정의
interface Curation {
  id: number;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export default function PostList() {
  const [curations, setCurations] = useState<Curation[]>([]);

  useEffect(() => {
    // 로컬호스트에서 데이터를 받아오는 API 호출
    fetch("http://localhost:8080/api/v1/curation")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // API 응답에서 data.data를 확인하고 상태 업데이트
        if (data && data.data) {
          setCurations(data.data);
        } else {
          console.error("No data found in the response");
        }
      })
      .catch((error) => console.error("Error fetching curations:", error));
  }, []);

  return (
    <div className="space-y-6 pt-4">
      {curations.length === 0 ? (
        <p>글이 없습니다.</p>
      ) : (
        curations.map((curation) => (
          <div key={curation.id} className="space-y-4 border-b pb-6">
            <div className="flex items-center space-x-2">
              <div>
                <p className="font-medium">{curation.createdBy}</p>
                <p className="text-xs text-gray-500">{curation.createdAt}</p>
              </div>
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
              <button className="mt-2 text-sm font-medium text-blue-600">
                더보기
              </button>
            </div>

            <div className="mt-4 rounded-lg border p-4">
              <div className="flex items-center space-x-3">
                <div>
                  <h3 className="font-medium">Content Link</h3>
                  <p className="text-sm text-gray-600">Description</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1 text-sm text-gray-500">
                  <Heart className="h-4 w-4" />
                  <span>42</span>
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
  );
}
