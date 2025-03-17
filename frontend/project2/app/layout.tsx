import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "개발자 커뮤니티",
  description: "함께 성장하는 개발자 커뮤니티입니다.",
  keywords: ["개발자", "커뮤니티", "질문답변", "스터디"],
  generator: "v0.dev",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
