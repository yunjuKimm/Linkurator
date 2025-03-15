import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import HeaderWrapper from "./components/HeaderWrapper"; // ✅ 새로 만든 컴포넌트 불러오기
import { ThemeProvider } from "./components/theme-context";
import Footer from "./components/footer";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "개발자 커뮤니티",
  description: "함께 성장하는 개발자 커뮤니티입니다.",
  keywords: ["개발자", "커뮤니티", "질문답변", "스터디"],
  generator: "v0.dev",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="ko">
      <body className={inter.className}>
      <ThemeProvider>
        <HeaderWrapper /> {/* ✅ 클라이언트에서만 실행되므로 usePathname() 사용 가능 */}
        <main className="container mx-auto px-4 max-w-screen-xl">{children}</main>
        <Footer />
        <Toaster position="bottom-right" richColors />
      </ThemeProvider>
      </body>
      </html>
  );
}
