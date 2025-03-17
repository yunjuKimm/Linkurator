"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ExternalLink, AlertCircle, Flag } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

// 신고 유형 정의
type ReportType = "SPAM" | "INAPPROPRIATE" | "ABUSE" | "FALSE_INFO"

// 신고 타입 정의
interface Report {
    id: number
    curationId: number
    curationTitle: string
    reportType: ReportType
    reportReason?: string
    createdAt: string
    status: "PENDING" | "REVIEWED" | "REJECTED"
}

export default function UserReportsPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [reports, setReports] = useState<Report[]>([])
    const [error, setError] = useState<string | null>(null)

    // 신고 유형 표시 이름
    const reportTypeNames: Record<ReportType, string> = {
        SPAM: "스팸",
        INAPPROPRIATE: "부적절한 콘텐츠",
        ABUSE: "욕설/비방",
        FALSE_INFO: "허위 정보",
    }

    // 신고 상태 표시 이름
    const reportStatusNames: Record<string, string> = {
        PENDING: "검토 중",
        REVIEWED: "검토 완료",
        REJECTED: "거부됨",
    }

    // 신고 상태별 배지 스타일
    const reportStatusBadgeVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        PENDING: "secondary",
        REVIEWED: "default",
        REJECTED: "destructive",
    }

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
                // 신고 데이터 가져오기 (실제 API 연동 시 수정 필요)
                // 현재는 예시 데이터를 사용합니다
                const mockReports: Report[] = [
                    {
                        id: 1,
                        curationId: 101,
                        curationTitle: "최신 개발 트렌드",
                        reportType: "SPAM",
                        reportReason: "광고성 콘텐츠가 포함되어 있습니다.",
                        createdAt: new Date().toISOString(),
                        status: "PENDING",
                    },
                    {
                        id: 2,
                        curationId: 102,
                        curationTitle: "웹 디자인 팁",
                        reportType: "INAPPROPRIATE",
                        reportReason: "부적절한 이미지가 포함되어 있습니다.",
                        createdAt: new Date(Date.now() - 86400000).toISOString(),
                        status: "REVIEWED",
                    },
                    {
                        id: 3,
                        curationId: 103,
                        curationTitle: "프로그래밍 언어 비교",
                        reportType: "FALSE_INFO",
                        reportReason: "잘못된 정보가 포함되어 있습니다.",
                        createdAt: new Date(Date.now() - 172800000).toISOString(),
                        status: "REJECTED",
                    },
                ]

                setReports(mockReports)
            } catch (err) {
                console.error("신고 데이터 로드 오류:", err)
                setError("신고 목록을 불러오는데 실패했습니다.")
            } finally {
                setIsLoading(false)
            }
        }

        checkAuthAndFetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
                <h1 className="text-3xl font-bold mb-2">내 신고 관리</h1>
                <p className="text-gray-500">내가 신고한 콘텐츠의 상태를 확인할 수 있습니다.</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-start mb-6">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {reports.length > 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>내 신고 목록</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>큐레이션</TableHead>
                                    <TableHead>신고 유형</TableHead>
                                    <TableHead>신고 사유</TableHead>
                                    <TableHead>신고일</TableHead>
                                    <TableHead>상태</TableHead>
                                    <TableHead className="text-right">작업</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center">
                                                <Flag className="h-4 w-4 mr-2 text-red-500" />
                                                {report.curationTitle}
                                            </div>
                                        </TableCell>
                                        <TableCell>{reportTypeNames[report.reportType]}</TableCell>
                                        <TableCell className="max-w-xs truncate">{report.reportReason || "-"}</TableCell>
                                        <TableCell>{formatDate(report.createdAt)}</TableCell>
                                        <TableCell>
                                            <Badge variant={reportStatusBadgeVariants[report.status]}>
                                                {reportStatusNames[report.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/curation/${report.curationId}`} target="_blank">
                                                <Button variant="outline" size="sm">
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </Link>
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
                    <p>신고한 콘텐츠가 없습니다.</p>
                </div>
            )}
        </div>
    )
}

