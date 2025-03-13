"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LogoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const performLogout = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/v1/members/logout", {
          method: "POST",
          credentials: "include", // 쿠키를 포함하여 요청
        });

        if (response.ok) {
          toast({
            title: "로그아웃 성공",
            description: "성공적으로 로그아웃되었습니다.",
          });

          setTimeout(() => {
            router.push("/index");
          }, 2000);

          setStatus("success");
        } else {
          const errorData = await response.json();
          setErrorMessage(errorData.message || "로그아웃 중 오류가 발생했습니다.");
          setStatus("error");
          toast({
            title: "로그아웃 실패",
            description: errorData.message || "로그아웃 중 오류가 발생했습니다.",
            variant: "destructive",
          });
        }
      } catch (error) {
        setErrorMessage("서버 연결 중 오류가 발생했습니다.");
        setStatus("error");
        toast({
          title: "오류",
          description: "서버 연결 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    };

    performLogout();
  }, [router, toast]);

  // ✅ `statusList` 객체 배열을 이용한 동적 렌더링
  const statusList = [
    {
      key: "loading",
      component: <p>로그아웃 처리 중...</p>,
    },
    {
      key: "error",
      component: (
          <div className="space-y-4">
            <p className="text-destructive">{errorMessage}</p>
            <Button onClick={() => router.push("/index")}>홈으로 돌아가기</Button>
          </div>
      ),
    },
    {
      key: "success",
      component: (
          <div className="space-y-4">
            <p>성공적으로 로그아웃되었습니다.</p>
            <p className="text-sm text-muted-foreground">잠시 후 홈페이지로 이동합니다...</p>
            <Button onClick={() => router.push("/index")}>홈으로 돌아가기</Button>
          </div>
      ),
    },
  ];

  return (
      <div className="container flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">로그아웃</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {status === "loading" && "로그아웃 처리 중..."}
            {status === "error" && "로그아웃 중 오류가 발생했습니다."}
            {status === "success" && "성공적으로 로그아웃되었습니다."}
          </CardContent>
        </Card>
      </div>
  );
}
