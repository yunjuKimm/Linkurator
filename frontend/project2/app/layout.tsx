import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "./components/header"
import { ThemeProvider } from "./components/theme-context"
import Footer from "./components/footer"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "개발자 커뮤니티",
  description: "함께 성장하는 개발자 커뮤니티입니다.",
  keywords: ["개발자", "커뮤니티", "질문답변", "스터디"],
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ThemeProvider>
          <Header />
          <main className="container mx-auto px-4 max-w-screen-xl">{children}</main>
          <Footer />
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'