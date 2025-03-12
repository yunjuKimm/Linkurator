"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function Header() {
  // 로그인 상태를 확인하는 상태 추가
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 컴포넌트 마운트 시 로그인 상태 확인
  useEffect(() => {
    // 여기서는 간단히 쿠키나 로컬 스토리지를 확인하는 로직을 구현할 수 있습니다
    // 실제 구현에서는 서버에서 세션 상태를 확인하는 것이 좋습니다
    const checkLoginStatus = () => {
      // 예시: 쿠키에서 토큰 확인
      const hasCookies = document.cookie.includes("accessToken")
      setIsLoggedIn(hasCookies)
    }

    checkLoginStatus()
  }, [])

  return (
    <header className="border-b">
      <div className="container flex h-14 items-center px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/placeholder.svg?height=32&width=32" alt="Logo" width={32} height={32} className="rounded" />
          </Link>
          <nav className="flex items-center space-x-4 text-sm font-medium">
            <Link href="/활동외" className="transition-colors hover:text-gray-600">
              활동외
            </Link>
            <Link href="/북마크" className="transition-colors hover:text-gray-600">
              북마크
            </Link>
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Link
                href="/create-curation"
                className="inline-flex h-9 items-center justify-center rounded-md bg-black px-3 text-sm font-medium text-white shadow hover:bg-gray-800"
              >
                새 글쓰기
              </Link>
              <div className="relative">
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                  <Image
                    src="/placeholder.svg?height=32&width=32"
                    alt="Avatar"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                로그인
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex h-9 items-center justify-center rounded-md bg-black px-3 text-sm font-medium text-white shadow hover:bg-gray-800"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

