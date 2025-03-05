import Link from "next/link";

export default function RightSidebar() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <h2 className="mb-4 text-lg font-semibold">오늘의 인기 큐레이션</h2>
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center">
              <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                1
              </span>
              <Link href="/post/3" className="font-medium hover:text-blue-600">
                디자인 시스템 구축 가이드
              </Link>
            </div>
            <p className="pl-8 text-xs text-gray-500">소희님 • 조회 1,234</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center">
              <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-bold">
                2
              </span>
              <Link href="/post/4" className="font-medium hover:text-blue-600">
                Next.js 13 마이그레이션
              </Link>
            </div>
            <p className="pl-8 text-xs text-gray-500">민호님 • 조회 997</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center">
              <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-bold">
                3
              </span>
              <Link href="/post/5" className="font-medium hover:text-blue-600">
                AI 프롬프트 엔지니어링
              </Link>
            </div>
            <p className="pl-8 text-xs text-gray-500">지수님 • 조회 856</p>
          </div>
        </div>
      </div>
    </div>
  );
}
