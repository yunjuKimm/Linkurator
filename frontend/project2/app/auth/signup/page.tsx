"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    memberId: "",
    password: "",
  })

  // ✅ 페이지 로드 시 /me 요청하여 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/v1/members/me", {
          method: "GET",
          credentials: "include",
        })
        if (res.ok) {
          // ✅ 이미 로그인된 상태면 홈으로 이동
          router.push("/home")
        }
      } catch (error) {
        console.error("로그인 상태 확인 오류:", error)
      }
    }
    checkLoginStatus()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:8080/api/v1/members/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.memberId,
          password: formData.password,
        }),
        credentials: "include",
      })

      if (response.ok) {
        // ✅ /me API 호출하여 로그인 상태 확인
        const meResponse = await fetch("http://localhost:8080/api/v1/members/me", {
          credentials: "include",
        })

        if (meResponse.ok) {
          console.log("✅ /me 요청 성공, 로그인 유지됨")
          window.dispatchEvent(new Event("login")) // ✅ 헤더 업데이트 이벤트 실행
          sessionStorage.setItem("isLoggedIn", "true")
          router.push("/home")
        } else {
          console.warn("⚠️ /me 요청 실패 (401 가능성 있음)", meResponse.status)
        }
      } else {
        const errorData = await response.json()
        setError(errorData.message || "아이디 또는 비밀번호가 올바르지 않습니다.")
      }
    } catch (error) {
      console.error("🚨 서버 연결 오류:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <div className="container flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
            <CardDescription className="text-center">계정에 로그인하고 큐레이션을 시작하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="memberId">아이디</Label>
                <Input
                    id="memberId"
                    name="memberId"
                    placeholder="아이디를 입력하세요"
                    required
                    value={formData.memberId}
                    onChange={handleChange}
                    className={error ? "border-red-500" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={error ? "border-red-500" : ""}
                />
              </div>

              {/* 에러 메시지 표시 */}
              {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "로그인 중..." : "로그인"}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <div className="text-center w-full text-sm">
              아직 계정이 없으신가요?{" "}
              <Link href="/auth/signup" className="text-primary underline font-medium">
                회원가입
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
  )
}

