"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Trash2, ExternalLink } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// 큐레이션 타입 정의
interface Curation {
    id: number
    title: string
    authorName: string
    createdAt: string
    likeCount: number
    viewCount: number
}

export default function AdminCurationsPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [isAdmin, setIsAdmin] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [curations, setCurations] = useState<Curation[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)

    // useEffect 부분을 수정하여 무한 루프 방지
    useEffect(() => {
        // 관리자 권한 확인
        const checkAdminAndFetchData = async () => {
            const userRole = sessionStorage.getItem("userRole")
            if (userRole !== "ADMIN") {
                toast({
                    title: "접근 권한 없음",
                    description: "관리자만 접근할 수 있는 페이지입니다.",
                    variant: "destructive",
                })
                router.push("/home")
                return
            }

            setIsAdmin(true)

            try {
                // 가상 데이터
                const mockCurations: Curation[] = Array.from({ length: 10 }, (_, i) => ({
                    id: 100 + i,
                    title: `큐레이션 제목 ${i + 1}`,
                    authorName: `작성자 ${i % 3 === 0 ? "김철수" : i % 3 === 1 ? "이영희" : "박지민"}`,
                    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
                    likeCount: Math.floor(Math.random() * 100),
                    viewCount: Math.floor(Math.random() * 1000),
                }))

                setCurations(mockCurations)
            } catch (error) {
                console.error("큐레이션 데이터 로드 오류:", error)
                toast({
                    title: "데이터 로드 실패",
                    description: "큐레이션 목록을 불러오는데 실패했습니다.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        checkAdminAndFetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // 의존성 배열을 비워서 컴포넌트 마운트 시 한 번만 실행되도록 함

    // 큐레이션 삭제 함수
    const handleDeleteCuration = async (id: number) => {
        if (!confirm(`정말로 큐레이션 #${id}을(를) 삭제하시겠습니까?`)) {
            return
        }

        setIsDeleting(true)

        try {
            const response = await fetch(`http://localhost:8080/api/v1/admin/curations/${id}`, {
                method: "DELETE",
                credentials: "include",
            })

            if (!response.ok) {
                throw new Error("큐레이션 삭제에 실패했습니다.")
            }

            // 삭제 성공 시 목록에서 제거
            setCurations(curations.filter((curation) => curation.id !== id))

            toast({
                title: "삭제 성공",
                description: `큐레이션 #${id}이(가) 성공적으로 삭제되었습니다.`,
            })
        } catch (error) {
            console.error("큐레이션 삭제 오류:", error)
            toast({
                title: "삭제 실패",
                description: "큐레이션을 삭제하는데 실패했습니다.",
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
        }
    }

    // 검색 필터링
    const filteredCurations = curations.filter(
        (curation) =>
            curation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            curation.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            curation.id.toString().includes(searchTerm),
    )

    // 날짜 형식화 함수
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    if (!isAdmin || isLoading) {
        return (
            <div className="container flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="container py-10">
            <div className="mb-6">
                <Link href="/admin" className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    관리자 대시보드로 돌아가기
                </Link>
                <h1 className="text-3xl font-bold mb-2">큐레이션 관리</h1>
                <p className="text-gray-500">큐레이션을 관리하고 삭제할 수 있습니다.</p>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>큐레이션 검색</CardTitle>
                </CardHeader>
                <CardContent>
                    <Input
                        placeholder="제목, 작성자 또는 ID로 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />
                </CardContent>
            </Card>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>제목</TableHead>
                            <TableHead>작성자</TableHead>
                            <TableHead>작성일</TableHead>
                            <TableHead className="text-right">조회수</TableHead>
                            <TableHead className="text-right">좋아요</TableHead>
                            <TableHead className="text-right">작업</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCurations.length > 0 ? (
                            <React.Fragment>
                                {filteredCurations.map((curation) => (
                                    <TableRow key={curation.id}>
                                        <TableCell>{curation.id}</TableCell>
                                        <TableCell className="font-medium">{curation.title}</TableCell>
                                        <TableCell>{curation.authorName}</TableCell>
                                        <TableCell>{formatDate(curation.createdAt)}</TableCell>
                                        <TableCell className="text-right">
                                            {curation.viewCount ? curation.viewCount.toLocaleString() : "0"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {curation.likeCount ? curation.likeCount.toLocaleString() : "0"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Link href={`/curation/${curation.id}`} target="_blank">
                                                    <Button variant="outline" size="sm">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteCuration(curation.id)}
                                                    disabled={isDeleting}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </React.Fragment>
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-4">
                                    검색 결과가 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

