import Link from "next/link";
import Image from "next/image";
import { Heart, MessageSquare, Bookmark, Share2 } from "lucide-react";

export default function PostList() {
  return (
    <div className="space-y-6 pt-4">
      {/* First Post */}
      <div className="space-y-4 border-b pb-6">
        <div className="flex items-center space-x-2">
          <Image
            src="/placeholder.svg?height=40&width=40"
            alt="김지민"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <p className="font-medium">김지민</p>
            <p className="text-xs text-gray-500">1시간 전</p>
          </div>
        </div>

        <div>
          <Link href="/post/1" className="group">
            <h2 className="text-xl font-bold group-hover:text-blue-600">
              ChatGPT를 활용한 생산성 향상 가이드
            </h2>
          </Link>
          <p className="mt-2 text-gray-600">
            ChatGPT의 최신 업데이트와 함께 새롭게 활용할 수 있는 생산성 향상
            방법들을 소개합니다. 특히 업무 자동화, 코드 리뷰, 문서 요약 등
            다양한 영역에서 ChatGPT를 활용하는 실질적인 방법들을 정리했습니다.
            화려한 장점뿐만 아니게 몇 가지 주의할 점...
          </p>
          <button className="mt-2 text-sm font-medium text-blue-600">
            더보기
          </button>
        </div>

        <div className="mt-4 rounded-lg border p-4">
          <div className="flex items-center space-x-3">
            <Image
              src="/placeholder.svg?height=48&width=48"
              alt="ChatGPT"
              width={48}
              height={48}
              className="rounded"
            />
            <div>
              <h3 className="font-medium">ChatGPT - OpenAI</h3>
              <p className="text-sm text-gray-600">
                AI 기반 대화형 언어 모델로, 다양한 작업을 지원하고 생산성을
                향상시킬 수 있습니다.
              </p>
              <p className="text-xs text-gray-500">openai.com</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          ChatGPT를 활용해 워크플로 최적화 요약을 자동화하는 방법이
          인상적이었습니다. 특히 올싱 녹취를 텍스트로 변환한 후 핵심 포인트만
          추출하는 프롬프트 활용법이요.
        </p>

        <div className="flex space-x-2">
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
            #AI
          </span>
          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            #생산성
          </span>
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

      {/* Second Post */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Image
            src="/placeholder.svg?height=40&width=40"
            alt="박민수"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <p className="font-medium">박민수</p>
            <p className="text-xs text-gray-500">3시간 전</p>
          </div>
        </div>

        <div>
          <Link href="/post/2" className="group">
            <h2 className="text-xl font-bold group-hover:text-blue-600">
              React 18의 새로운 기능 살펴보기
            </h2>
          </Link>
          <p className="mt-2 text-gray-600">
            React 18의 주요 변경사항과 새로운 기능들을 자세히 살펴봅니다.
            Concurrent Rendering의 개념과 실제 구현 방법, Suspense와 Transition
            API의 활용, 자동 배치 처리의 이점 등을 다룹니다. 특히 대규모
            애플리케이션에서의 성능 최적화...
          </p>
          <button className="mt-2 text-sm font-medium text-blue-600">
            더보기
          </button>
        </div>

        <div className="mt-4 rounded-lg border p-4">
          <div className="flex items-center space-x-3">
            <Image
              src="/placeholder.svg?height=48&width=48"
              alt="React"
              width={48}
              height={48}
              className="rounded"
            />
            <div>
              <h3 className="font-medium">React 18 Documentation</h3>
              <p className="text-sm text-gray-600">
                React 18의 새로운 기능과 Concurrent 렌더링에 대한 공식
                문서입니다.
              </p>
              <p className="text-xs text-gray-500">reactjs.org</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600">
          React 18에서 도입된 Concurrent 렌더링의 실제 활용 사례를 정리했습니다.
          Suspense와 함께 사용하면 UX가 확실히 개선되는 것 같네요.
        </p>

        <div className="flex space-x-2">
          <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
            #개발
          </span>
          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
            #React
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-sm text-gray-500">
              <Heart className="h-4 w-4" />
              <span>35</span>
            </button>
            <button className="flex items-center space-x-1 text-sm text-gray-500">
              <MessageSquare className="h-4 w-4" />
              <span>8</span>
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
    </div>
  );
}
