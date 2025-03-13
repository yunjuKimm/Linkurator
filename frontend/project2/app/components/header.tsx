"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, useRef } from "react"
import { ChevronDown, LogOut, User, Settings } from "lucide-react"

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [userImage, setUserImage] = useState("/placeholder.svg?height=32&width=32")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  console.log("🔥 [Header] 컴포넌트 렌더링됨. isLoggedIn:", isLoggedIn)

  const checkLoginStatus = async () => {
    console.log("🔄 [checkLoginStatus] 실행됨...")
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:8080/api/v1/members/me", {
        credentials: "include",
      })

      console.log("🛠 [API] /me 요청 결과:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ [API] 사용자 정보:", data)

        if (data.data) {
          setIsLoggedIn(true)
          setUserName(data.data.username || data.data.memberId || "사용자")
          setUserImage(data.data.profileImage || "/placeholder.svg?height=32&width=32")
          sessionStorage.setItem("isLoggedIn", "true")
          sessionStorage.setItem("userName", data.data.username || "사용자")
          sessionStorage.setItem("userImage", data.data.profileImage || "/placeholder.svg?height=32&width=32")
        } else {
          setIsLoggedIn(false)
        }
      } else {
        setIsLoggedIn(false)
      }
    } catch (error) {
      console.error("🚨 [오류] 로그인 상태 확인 중:", error)
      setIsLoggedIn(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log("📌 [useEffect] 실행됨 - 로그인 상태 확인 시작")
    const savedLoginStatus = sessionStorage.getItem("isLoggedIn")
    if (savedLoginStatus === "true") {
      setIsLoggedIn(true)
      setUserName(sessionStorage.getItem("userName") || "사용자")
      setUserImage(sessionStorage.getItem("userImage") || "/placeholder.svg?height=32&width=32")
    } else {
      checkLoginStatus()
    }
    window.addEventListener("login", checkLoginStatus)
    return () => {
      window.removeEventListener("login", checkLoginStatus)
    }
  }, [])

  const handleLogout = async () => {
    console.log("🔴 [로그아웃] 요청 시작...")
    try {
      const res = await fetch("http://localhost:8080/api/v1/members/logout", {
        method: "POST",
        credentials: "include",
      })
      if (res.ok) {
        setIsLoggedIn(false)
        setUserName("")
        setUserImage("/placeholder.svg?height=32&width=32")
        document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;"
        sessionStorage.removeItem("isLoggedIn")
        sessionStorage.removeItem("userName")
        sessionStorage.removeItem("userImage")
        window.dispatchEvent(new Event("login"))
        window.location.reload()
      }
    } catch (error) {
      console.error("🚨 [로그아웃 오류]:", error)
    }
  }

  return (
      <header className="border-b">
        <div className="container flex h-14 items-center px-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/placeholder.svg?height=32&width=32" alt="Logo" width={32} height={32} className="rounded" />
            </Link>
            <nav className="flex items-center space-x-4 text-sm font-medium">
              <Link href="/활동외" className="transition-colors hover:text-gray-600">활동외</Link>
              <Link href="/북마크" className="transition-colors hover:text-gray-600">북마크</Link>
            </nav>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            {isLoading ? (
                <div className="h-9 w-20 bg-gray-200 rounded-md animate-pulse"></div>
            ) : isLoggedIn ? (
                <>
                  <Link href="/create-curation" className="inline-flex h-9 items-center justify-center rounded-md bg-black px-3 text-sm font-medium text-white shadow hover:bg-gray-800">
                    새 글쓰기
                  </Link>
                  <div className="relative" ref={dropdownRef}>
                    <button className="flex items-center space-x-2 rounded-md px-2 py-1 hover:bg-gray-100" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 overflow-hidden">
                        <Image src={userImage || "/placeholder.svg"} alt="Avatar" width={32} height={32} className="rounded-full object-cover" />
                      </div>
                      <span className="font-medium">{userName}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                </>
            ) : (
                <>
                  <Link href="/auth/login">로그인</Link>
                  <Link href="/auth/signup">회원가입</Link>
                </>
            )}
          </div>
        </div>
      </header>
  )
}
