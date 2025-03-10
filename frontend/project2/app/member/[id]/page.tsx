"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import Link from "next/link";
import RightSidebar from "@/app/components/right-sidebar";
import { ArrowLeft, UserPlus, BookOpen } from "lucide-react";

// 큐레이터 데이터 타입 정의
interface CuratorData {
  username: string;
  profileImage: string;
  introduce: string;
  curationCount: number;
}

export default function CuratorProfile() {
  const params = useParams(); // ✅ 변경: useParams()로 params 가져오기
  const router = useRouter();
  const [curator, setCurator] = useState<CuratorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCuratorInfo() {
      if (!params.id) return; // ✅ 변경: params.id가 존재할 때만 실행

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `http://localhost:8080/api/v1/members/${params.id}`
        );
        setCurator(response.data.data);
      } catch (err) {
        setError("큐레이터 정보를 불러올 수 없습니다.");
        console.error("Error fetching curator data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCuratorInfo();
  }, [params.id]); // ✅ 변경: useEffect가 params.id 변경을 감지하도록 설정

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-200 rounded-md bg-red-50 flex items-center justify-center min-h-[40vh]">
        <div>
          <h2 className="text-xl font-bold mb-2">오류가 발생했습니다</h2>
          <p>⚠️ {error}</p>
        </div>
      </div>
    );
  }

  if (!curator) {
    return (
      <div className="text-gray-500 p-4 border border-gray-200 rounded-md bg-gray-50 flex items-center justify-center min-h-[40vh]">
        <div>
          <h2 className="text-xl font-bold mb-2">데이터를 찾을 수 없습니다</h2>
          <p>요청하신 큐레이터 정보가 존재하지 않습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container grid grid-cols-12 gap-6 px-4 py-6">
      <div className="col-span-12 lg:col-span-9">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-500 hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로가기
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex flex-col items-center">
            <Image
              src={curator.profileImage || "/default-profile.png"}
              alt={`${curator.username} 프로필`}
              width={120}
              height={120}
              className="rounded-full"
            />
            <h1 className="mt-4 text-2xl font-bold">{curator.username}</h1>
            <p className="text-gray-600 mt-2 text-center">
              {curator.introduce || "소개 정보 없음"}
            </p>

            <div className="mt-4 flex space-x-4">
              <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                <UserPlus className="w-4 h-4 mr-2" />
                팔로우
              </button>
              <Link
                href={`/curation?author=${curator.username}`}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                큐레이션 보기 ({curator.curationCount})
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-3">
        <div className="sticky top-6 space-y-6">
          <RightSidebar />
        </div>
      </div>
    </main>
  );
}
