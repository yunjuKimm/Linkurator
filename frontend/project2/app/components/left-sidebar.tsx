import Link from "next/link";
import { Hash } from "lucide-react";

export default function LeftSidebar() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-lg font-semibold">트렌딩 태그</h2>
        <nav className="space-y-1">
          <Link
            href="/tag/ai"
            className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100"
          >
            <Hash className="mr-2 h-4 w-4" />
            <span>#AI</span>
          </Link>
          <Link
            href="/tag/개발"
            className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100"
          >
            <Hash className="mr-2 h-4 w-4" />
            <span>#개발</span>
          </Link>
          <Link
            href="/tag/생산성"
            className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100"
          >
            <Hash className="mr-2 h-4 w-4" />
            <span>#생산성</span>
          </Link>
          <Link
            href="/tag/자바스크립트"
            className="flex items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100"
          >
            <Hash className="mr-2 h-4 w-4" />
            <span>#자바스크립트</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
