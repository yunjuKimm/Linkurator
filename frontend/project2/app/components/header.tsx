"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { ChevronDown, LogOut, User, Settings } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState(
    "/placeholder.svg?height=32&width=32"
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // 클라이언트 사이드에서만 실행되는 코드를 분리
  const isBrowser = typeof window !== "undefined";

  const checkLoginStatus = async () => {
    if (!isBrowser) return; // 서버 사이드에서는 실행하지 않음

    console.log("로그인 상태 확인 중...");

    // 이미 세션에 로그인 정보가 있으면 API 호출 스킵
    const savedLoginStatus = sessionStorage.getItem("isLoggedIn");
    if (savedLoginStatus === "true") {
      setIsLoggedIn(true);
      setUserName(sessionStorage.getItem("userName") || "사용자");
      setUserImage(
        sessionStorage.getItem("userImage") ||
          "/placeholder.svg?height=32&width=32"
      );
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/v1/members/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("사용자 정보:", data);

        if (data.data) {
          setIsLoggedIn(true);
          setUserName(data.data.username || data.data.memberId || "사용자");
          setUserImage(
            data.data.profileImage || "/placeholder.svg?height=32&width=32"
          );
          sessionStorage.setItem("isLoggedIn", "true");
          sessionStorage.setItem("userName", data.data.username || "사용자");
          sessionStorage.setItem(
            "userImage",
            data.data.profileImage || "/placeholder.svg?height=32&width=32"
          );
          sessionStorage.setItem("userId", data.data.id || "");
        } else {
          setIsLoggedIn(false);
          clearSessionData();
        }
      } else {
        setIsLoggedIn(false);
        clearSessionData();
      }
    } catch (error) {
      console.error("로그인 상태 확인 중 오류:", error);
      setIsLoggedIn(false);
      clearSessionData();
    } finally {
      setIsLoading(false);
    }
  };

  const clearSessionData = () => {
    if (!isBrowser) return; // 서버 사이드에서는 실행하지 않음

    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userImage");
    sessionStorage.removeItem("userId");
  };

  // 페이지 이동 시마다 로그인 상태 확인
  useEffect(() => {
    if (!isBrowser) return; // 서버 사이드에서는 실행하지 않음

    // 경로가 변경되었을 때만 로그인 상태 확인
    const prevPathname = sessionStorage.getItem("prevPathname");
    if (prevPathname !== pathname) {
      sessionStorage.setItem("prevPathname", pathname);
      checkLoginStatus();
    }
  }, [pathname, isBrowser]);

  // 초기 로그인 상태 확인 및 이벤트 리스너 설정
  useEffect(() => {
    if (!isBrowser) return; // 서버 사이드에서는 실행하지 않음

    console.log("헤더 컴포넌트 마운트 - 로그인 상태 확인 시작");
    const savedLoginStatus = sessionStorage.getItem("isLoggedIn");
    if (savedLoginStatus === "true") {
      setIsLoggedIn(true);
      setUserName(sessionStorage.getItem("userName") || "사용자");
      setUserImage(
        sessionStorage.getItem("userImage") ||
          "/placeholder.svg?height=32&width=32"
      );
      setIsLoading(false);
    } else {
      checkLoginStatus();
    }

    const handleLoginEvent = () => {
      console.log("로그인 이벤트 감지됨");
      // 즉시 로그인 상태 업데이트
      const savedLoginStatus = sessionStorage.getItem("isLoggedIn");
      if (savedLoginStatus === "true") {
        setIsLoggedIn(true);
        setUserName(sessionStorage.getItem("userName") || "사용자");
        setUserImage(
          sessionStorage.getItem("userImage") ||
            "/placeholder.svg?height=32&width=32"
        );
        setIsLoading(false);
      } else {
        // 세션 스토리지에 정보가 없으면 API 호출
        checkLoginStatus();
      }
    };

    const handleLogoutEvent = () => {
      setIsLoggedIn(false);
      clearSessionData();
      setIsLoading(false);
    };

    window.addEventListener("login", handleLoginEvent);
    window.addEventListener("logout", handleLogoutEvent);

    // 드롭다운 외부 클릭 시 닫기
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("login", handleLoginEvent);
      window.removeEventListener("logout", handleLogoutEvent);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isBrowser]);

  const handleLogout = async () => {
    if (!isBrowser) return; // 서버 사이드에서는 실행하지 않음

    console.log("로그아웃 요청 시작...");
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/members/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        setIsLoggedIn(false);
        setUserName("");
        setUserImage("/placeholder.svg?height=32&width=32");
        document.cookie =
          "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        clearSessionData();
        window.dispatchEvent(new Event("logout"));
        window.location.href = "/home";
      } else {
        console.error("로그아웃 실패");
      }
    } catch (error) {
      console.error("로그아웃 오류:", error);
    }
    setIsDropdownOpen(false);
  };

  return (
    <header className="border-b">
      <div className="container flex h-14 items-center px-4">
        <div className="flex items-center space-x-4">
          <Link href="/home" className="flex items-center space-x-2">
            <Image
              src="/placeholder.svg?height=32&width=32"
              alt="Logo"
              width={32}
              height={32}
              className="rounded"
            />
          </Link>
          <nav className="flex items-center space-x-4 text-sm font-medium">
            <Link
              href="/활동외"
              className="transition-colors hover:text-gray-600"
            >
              활동외
            </Link>
            <Link
              href="/북마크"
              className="transition-colors hover:text-gray-600"
            >
              북마크
            </Link>
            <Link
              href="/explore/playlists"
              className="transition-colors hover:text-gray-600"
            >
              플레이리스트 탐색
            </Link>
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {isLoading ? (
            <div className="h-9 w-20 bg-gray-200 rounded-md animate-pulse"></div>
          ) : isLoggedIn ? (
            <>
              <Link
                href="/create-curation"
                className="inline-flex h-9 items-center justify-center rounded-md bg-black px-3 text-sm font-medium text-white shadow hover:bg-gray-800"
              >
                새 글쓰기
              </Link>
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center space-x-2 rounded-md px-2 py-1 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 overflow-hidden">
                    <Image
                      src={userImage || "/placeholder.svg"}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <span className="font-medium">{userName}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        내정보
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        설정
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        로그아웃
                      </button>
                    </div>
                  </div>
                )}
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
  );
}
