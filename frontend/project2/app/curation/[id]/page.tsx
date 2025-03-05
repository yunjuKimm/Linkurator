import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  ArrowLeft,
} from "lucide-react";
import CommentSection from "@/app/components/comment-section";

export default function PostDetail({ params }: { params: { id: string } }) {
  // 여기서는 정적 데이터를 사용하지만, 실제로는 params.id를 사용하여 데이터를 가져올 수 있습니다
  const post = {
    id: params.id,
    title:
      params.id === "1"
        ? "ChatGPT를 활용한 생산성 향상 가이드"
        : params.id === "2"
        ? "React 18의 새로운 기능 살펴보기"
        : params.id === "3"
        ? "디자인 시스템 구축 가이드"
        : params.id === "4"
        ? "Next.js 13 마이그레이션"
        : "AI 프롬프트 엔지니어링",
    author:
      params.id === "1"
        ? "김지민"
        : params.id === "2"
        ? "박민수"
        : params.id === "3"
        ? "소희"
        : params.id === "4"
        ? "민호"
        : "지수",
    authorImage: "/placeholder.svg?height=40&width=40",
    postedAt: "1일 전",
    likes:
      params.id === "1"
        ? 42
        : params.id === "2"
        ? 35
        : params.id === "3"
        ? 78
        : params.id === "4"
        ? 56
        : 62,
    comments: 12,
    content: `
      <p>안녕하세요, 여러분! 오늘은 ${
        params.id === "1"
          ? "ChatGPT를 활용해 생산성을 향상시키는 다양한 방법"
          : params.id === "2"
          ? "React 18에서 새롭게 도입된 기능들과 그 활용 방법"
          : params.id === "3"
          ? "효율적인 디자인 시스템을 구축하는 방법과 그 이점"
          : params.id === "4"
          ? "Next.js 13으로 마이그레이션하는 방법과 주의사항"
          : "AI 프롬프트 엔지니어링의 기본 원칙과 실용적인 팁"
      }에 대해 이야기해보려고 합니다.</p>
      
      <h2>배경</h2>
      <p>${
        params.id === "1"
          ? "최근 몇 년간 AI 기술은 급속도로 발전했으며, 특히 ChatGPT와 같은 대화형 AI 모델은 우리의 일상과 업무 방식을 크게 변화시키고 있습니다. 이러한 도구를 효과적으로 활용하면 작업 시간을 단축하고 결과물의 질을 높일 수 있습니다."
          : params.id === "2"
          ? "React 18은 2022년 3월에 정식 출시되었으며, Concurrent Rendering이라는 새로운 렌더링 방식을 도입했습니다. 이 변화는 React 애플리케이션의 성능과 사용자 경험을 크게 향상시킵니다."
          : params.id === "3"
          ? "디자인 시스템은 제품 개발 과정에서 일관성과 효율성을 높이는 중요한 요소입니다. 잘 구축된 디자인 시스템은 개발자와 디자이너 간의 협업을 원활하게 하고, 제품의 품질을 향상시킵니다."
          : params.id === "4"
          ? "Next.js 13은 App Router, React Server Components 등 많은 혁신적인 기능을 도입했습니다. 이 버전으로의 마이그레이션은 도전적일 수 있지만, 제공되는 이점은 그만한 가치가 있습니다."
          : "AI 프롬프트 엔지니어링은 AI 모델과 효과적으로 상호작용하는 기술입니다. 좋은 프롬프트는 AI의 출력 품질을 크게 향상시킬 수 있으며, 이는 AI 도구를 활용하는 모든 분야에서 중요합니다."
      }</p>
      
      <h2>주요 내용</h2>
      <p>${
        params.id === "1"
          ? "ChatGPT를 활용한 생산성 향상 방법은 다양합니다. 첫째, 반복적인 이메일이나 메시지 작성을 자동화할 수 있습니다. 둘째, 복잡한 정보를 요약하거나 분석하는 데 도움을 받을 수 있습니다. 셋째, 코드 작성이나 디버깅 과정에서 도움을 받을 수 있습니다."
          : params.id === "2"
          ? "React 18의 주요 기능으로는 자동 배치(Automatic Batching), Transitions, Suspense for Data Fetching 등이 있습니다. 특히 Concurrent 모드는 대규모 애플리케이션에서 사용자 경험을 크게 개선할 수 있습니다."
          : params.id === "3"
          ? "효과적인 디자인 시스템 구축의 핵심 요소로는 일관된 컴포넌트 라이브러리, 명확한 사용 지침, 확장 가능한 아키텍처 등이 있습니다. 이를 통해 제품 개발의 속도와 품질을 모두 향상시킬 수 있습니다."
          : params.id === "4"
          ? "Next.js 13 마이그레이션에서 주의해야 할 점은 App Router로의 전환, React Server Components 적용, 이미지 최적화 방식의 변화 등이 있습니다. 단계적인 접근이 중요합니다."
          : "효과적인 AI 프롬프트를 작성하기 위해서는 명확성, 구체성, 맥락 제공이 중요합니다. 또한 프롬프트의 구조와 형식도 결과물의 품질에 큰 영향을 미칩니다."
      }</p>
      
      <h2>실제 적용 사례</h2>
      <p>${
        params.id === "1"
          ? "저는 최근 프로젝트에서 ChatGPT를 활용하여 회의 내용을 요약하고 중요한 액션 아이템을 추출하는 작업을 자동화했습니다. 이를 통해 회의 후 정리 시간을 90% 이상 단축할 수 있었습니다."
          : params.id === "2"
          ? "저희 팀은 대규모 데이터를 다루는 대시보드 애플리케이션에 React 18의 Suspense와 Transitions를 적용했습니다. 결과적으로 UI의 반응성이 크게 향상되었고, 사용자 경험이 개선되었습니다."
          : params.id === "3"
          ? "저희 회사는 Figma와 Storybook을 활용하여 종합적인 디자인 시스템을 구축했습니다. 이를 통해 디자인-개발 간 소통이 원활해졌고, 제품 개발 시간이 30% 이상 단축되었습니다."
          : params.id === "4"
          ? "중간 규모의 웹 애플리케이션을 Next.js 13으로 마이그레이션한 경험을 공유합니다. 점진적인 접근 방식을 통해 4주 만에 성공적으로 전환을 완료했으며, 페이지 로딩 시간이 40% 개선되었습니다."
          : "마케팅 콘텐츠 생성에 AI 프롬프트 엔지니어링을 적용한 사례를 소개합니다. 체계적인 프롬프트 구조와 반복적인 피드백을 통해 AI가 생성하는 콘텐츠의 품질을 크게 향상시켰습니다."
      }</p>
      
      <h2>주의사항 및 한계점</h2>
      <p>${
        params.id === "1"
          ? "ChatGPT를 활용할 때는 몇 가지 주의사항이 있습니다. 첫째, 민감한 정보는 항상 주의해서 다루어야 합니다. 둘째, AI의 출력은 항상 검증이 필요합니다. 셋째, 과도한 의존은 창의성과 비판적 사고 능력을 저하시킬 수 있습니다."
          : params.id === "2"
          ? "React 18의 새로운 기능을 도입할 때는 기존 코드와의 호환성 문제를 주의해야 합니다. 특히 서드파티 라이브러리가 Concurrent 모드를 완전히 지원하지 않을 수 있습니다."
          : params.id === "3"
          ? "디자인 시스템 구축의 어려움으로는 초기 투자 비용, 팀 간 합의 도출, 지속적인 유지보수 등이 있습니다. 이러한 도전을 극복하기 위한 전략도 함께 논의하겠습니다."
          : params.id === "4"
          ? "Next.js 13 마이그레이션 과정에서 발생할 수 있는 문제점과 해결 방법을 공유합니다. 특히 데이터 패칭 방식의 변화와 관련된 이슈가 많았습니다."
          : "AI 프롬프트 엔지니어링의 한계와 주의사항에 대해 논의합니다. AI 모델의 기본적인 한계를 이해하고, 이를 보완하는 전략이 중요합니다."
      }</p>
      
      <h2>결론</h2>
      <p>${
        params.id === "1"
          ? "ChatGPT는 강력한 도구이지만, 그것을 효과적으로 활용하는 방법을 알아야 진정한 생산성 향상을 이룰 수 있습니다. 이 글에서 소개한 방법들을 시도해보고, 여러분만의 효과적인 활용법을 찾아보세요."
          : params.id === "2"
          ? "React 18은 웹 애플리케이션 개발의 새로운 시대를 열어가고 있습니다. 새로운 기능들을 적절히 활용하면 사용자 경험을 크게 개선할 수 있습니다. 점진적으로 도입하고 실험해보는 것을 추천합니다."
          : params.id === "3"
          ? "효과적인 디자인 시스템은 단순한 컴포넌트 모음이 아니라, 제품 개발의 철학과 원칙을 담고 있어야 합니다. 이러한 접근을 통해 장기적으로 더 높은 가치를 창출할 수 있습니다."
          : params.id === "4"
          ? "Next.js 13으로의 마이그레이션은 도전적이지만 보람 있는 여정입니다. 점진적인 접근과 충분한 테스트를 통해 성공적인 전환을 이룰 수 있습니다."
          : "AI 프롬프트 엔지니어링은 앞으로 더욱 중요해질 기술입니다. 지속적인 학습과 실험을 통해 이 분야의 전문성을 키워나가는 것을 추천합니다."
      }</p>
    `,
    tags:
      params.id === "1"
        ? ["AI", "생산성"]
        : params.id === "2"
        ? ["개발", "React"]
        : params.id === "3"
        ? ["디자인", "UI/UX"]
        : params.id === "4"
        ? ["Next.js", "마이그레이션"]
        : ["AI", "프롬프트 엔지니어링"],
    tagColors:
      params.id === "1"
        ? ["blue", "green"]
        : params.id === "2"
        ? ["purple", "yellow"]
        : params.id === "3"
        ? ["pink", "indigo"]
        : params.id === "4"
        ? ["cyan", "amber"]
        : ["blue", "violet"],
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
                alt={post.author}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="font-medium">{post.author}</p>
                <p className="text-xs text-gray-500">{post.postedAt}</p>
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
                    {post.id === "1"
                      ? "ChatGPT 공식 문서"
                      : post.id === "2"
                      ? "React 18 공식 문서"
                      : post.id === "3"
                      ? "디자인 시스템 가이드"
                      : post.id === "4"
                      ? "Next.js 13 마이그레이션 가이드"
                      : "AI 프롬프트 엔지니어링 핸드북"}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">
                    {post.id === "1"
                      ? "OpenAI에서 제공하는 ChatGPT 활용 가이드 및 API 문서"
                      : post.id === "2"
                      ? "React 18의 새로운 기능과 마이그레이션 가이드"
                      : post.id === "3"
                      ? "효과적인 디자인 시스템 구축을 위한 종합 가이드"
                      : post.id === "4"
                      ? "Next.js 13으로 업그레이드하기 위한 공식 가이드"
                      : "AI 프롬프트 작성을 위한 실용적인 기술과 팁"}
                  </p>
                  <div className="flex items-center text-sm">
                    <span className="text-blue-600">
                      {post.id === "1"
                        ? "openai.com"
                        : post.id === "2"
                        ? "reactjs.org"
                        : post.id === "3"
                        ? "designsystem.guide"
                        : post.id === "4"
                        ? "nextjs.org/docs"
                        : "promptengineering.ai"}
                    </span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-gray-500">바로가기</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            {post.tags.map((tag, index) => (
              <span
                key={tag}
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  post.tagColors[index] === "blue"
                    ? "bg-blue-100 text-blue-800"
                    : post.tagColors[index] === "green"
                    ? "bg-green-100 text-green-800"
                    : post.tagColors[index] === "purple"
                    ? "bg-purple-100 text-purple-800"
                    : post.tagColors[index] === "yellow"
                    ? "bg-yellow-100 text-yellow-800"
                    : post.tagColors[index] === "pink"
                    ? "bg-pink-100 text-pink-800"
                    : post.tagColors[index] === "indigo"
                    ? "bg-indigo-100 text-indigo-800"
                    : post.tagColors[index] === "cyan"
                    ? "bg-cyan-100 text-cyan-800"
                    : post.tagColors[index] === "amber"
                    ? "bg-amber-100 text-amber-800"
                    : post.tagColors[index] === "violet"
                    ? "bg-violet-100 text-violet-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                #{tag}
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
                <span>{post.comments}</span>
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

          <CommentSection postId={params.id} />
        </article>
      </div>

      <div className="col-span-3">
        <div className="sticky top-6 space-y-6">
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold">관련 글</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/post/1" className="text-sm hover:text-blue-600">
                  ChatGPT를 활용한 생산성 향상 가이드
                </Link>
              </li>
              <li>
                <Link href="/post/2" className="text-sm hover:text-blue-600">
                  React 18의 새로운 기능 살펴보기
                </Link>
              </li>
              <li>
                <Link href="/post/3" className="text-sm hover:text-blue-600">
                  디자인 시스템 구축 가이드
                </Link>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold">이 글의 작성자</h3>
            <div className="flex items-center space-x-3">
              <Image
                src={post.authorImage || "/placeholder.svg"}
                alt={post.author}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="font-medium">{post.author}</p>
                <p className="text-xs text-gray-500">15개의 글 작성</p>
              </div>
            </div>
            <button className="mt-3 w-full rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50">
              팔로우
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
