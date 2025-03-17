"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Trash2, ExternalLink, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// 댓글 타입 정의
interface Comment {
    id: number
    content: string
    curationId: number
    curationTitle: string
    createdAt: string
}

export default function UserCommentsPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [comments, setComments] = useState<Comment[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // 로그인 확인
        const checkAuthAndFetchData = async () => {
            const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true"

            if (!isLoggedIn) {
                toast({
                    title: "로그인이 필요합니다",
                    description: "로그인 페이지로 이동합니다.",
                    variant: "destructive",
                })
                router.push("/auth/login")
                return
            }

            try {
                // 댓글 데이터 가져오기 (실제 API 연동 시 수정 필요)
                // 현재는 예시 데이터를 사용합니다
                const mockComments: Comment[] = [
                    {
                        id: 1,
                        content: "정말 유익한 글이네요!",
                        curationId: 101,
                        curationTitle: "최신 개발 트렌드",
                        createdAt: new Date().toISOString(),
                    },
                    {
                        id: 2,
                        content: "이 부분에 대해 더 자세히 알고 싶어요.",
                        curationId: 102,
                        curationTitle: "웹 디자인 팁",
                        createdAt: new Date(Date.now() - 86400000).toISOString(),
                    },
                    {
                        id: 3,
                        content: "좋은 정보 감사합니다.",
                        curationId: 103,
                        curationTitle: "프로그래밍 언어 비교",
                        createdAt: new Date(Date.now() - 172800000).toISOString(),
                    },
                ]

                setComments(mockComments)
            } catch (err) {
                console.error("댓글 데이터 로드 오류:", err)
                setError("댓글 목록을 불러오는데 실패했습니다.")
            } finally {
                setIsLoading(false)
            }
        }

        checkAuthAndFetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // 댓글 삭제 함수
    const handleDeleteComment = async (id: number) => {
        if (!confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
            return
        }

        try {
            // 실제 API 연동 시 수정 필요
            // const response = await fetch(`http://localhost:8080/api/v1/comments/${id}`, {
            //   method: "DELETE",
            //   credentials: "include",
            // })

            // if (!response.ok) {
            //   throw new Error("댓글 삭제에 실패했습니다.")
            // }

            // 삭제 성공 시 목록에서 제거
            setComments(comments.filter((comment) => comment.id !== id))

            toast({
                title: "삭제 성공",
                description: "댓글이 성공적으로 삭제되었습니다.",
            })
        } catch (err) {
            console.error("댓글 삭제 오류:", err)
            toast({
                title: "삭제 실패",
                description: "댓글을 삭제하는데 실패했습니다.",
                variant: "destructive",
            })
        }
    }

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

    if (isLoading) {
        return (
            <div className="container flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="container py-10">
            <div className="mb-6">
                <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    대시보드로 돌아가기
                </Link>
                <h1 className="text-3xl font-bold mb-2">내 댓글 관리</h1>
                <p className="text-gray-500">내가 작성한 댓글을 확인하고 관리할 수 있습니다.</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-start mb-6">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {comments.length > 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>내 댓글 목록</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>내용</TableHead>
                                    <TableHead>큐레이션</TableHead>
                                    <TableHead>작성일</TableHead>
                                    <TableHead className="text-right">작업</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {comments.map((comment) => (
                                    <TableRow key={comment.id}>
                                        <TableCell className="font-medium max-w-md truncate">{comment.content}</TableCell>
                                        <TableCell>{comment.curationTitle}</TableCell>
                                        <TableCell>{formatDate(comment.createdAt)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Link href={`/curation/${comment.curationId}`} target="_blank">
                                                    <Button variant="outline" size="sm">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="destructive" size="sm" onClick={() => handleDeleteComment(comment.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex items-center p-4 bg-yellow-50 rounded-md text-yellow-800">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <p>작성한 댓글이 없습니다.</p>
                </div>
            )}
        </div>
    )
}

