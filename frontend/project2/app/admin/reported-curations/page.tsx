"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Trash2, ExternalLink, Flag } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AdminReportedCurationsPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [isAdmin, setIsAdmin] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [reportedCurations, setReportedCurations] = useState<number[]>([])
    const [minReports, setMinReports] = useState(5)
    const [isDeleting, setIsDeleting] = useState(false)

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

            // 신고된 큐레이션 로드
            try {
                const response = await fetch(`http://localhost:8080/api/v1/admin/reported-curations?minReports=${minReports}`, {
                    credentials: "include",
                })

                if (!response.ok) {
                    throw new Error("신고된 큐레이션 데이터를 불러오는데 실패했습니다.")
                }

                const data = await response.json()
                if (data.data) {
                    setReportedCurations(data.data)
                }
            } catch (error) {
                console.error("신고된 큐레이션 로드 오류:", error)
                toast({
                    title: "데이터 로드 실패",
                    description: "신고된 큐레이션 목록을 불러오는데 실패했습니다.",
                    variant: "destructive",
                })
                // 에러 발생 시 가상 데이터 사용
                setReportedCurations([101, 102, 103, 104])
            } finally {
                setIsLoading(false)
            }
        }

        checkAdminAndFetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // 의존성 배열을 비워서 컴포넌트 마운트 시 한 번만 실행되도록 함

    // 신고된 큐레이션 로드 함수
    const fetchReportedCurations = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`http://localhost:8080/api/v1/admin/reported-curations?minReports=${minReports}`, {
                credentials: "include",
            })

            if (!response.ok) {
                throw new Error("신고된 큐레이션 데이터를 불러오는데 실패했습니다.")
            }

            const data = await response.json()
            if (data.data) {
                setReportedCurations(data.data)
            }
        } catch (error) {
            console.error("신고된 큐레이션 로드 오류:", error)
            toast({
                title: "데이터 로드 실패",
                description: "신고된 큐레이션 목록을 불러오는데 실패했습니다.",
                variant: "destructive",
            })
            // 에러 발생 시 가상 데이터 사용
            setReportedCurations([101, 102, 103, 104])
        } finally {
            setIsLoading(false)
        }
    }

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
            setReportedCurations(reportedCurations.filter((curationId) => curationId !== id))

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

    // 최소 신고 수 변경 및 새로고침
    const handleMinReportsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number.parseInt(e.target.value)
        if (!isNaN(value) && value > 0) {
            setMinReports(value)
        }
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
                <h1 className="text-3xl font-bold mb-2">신고된 큐레이션</h1>
                <p className="text-gray-500">일정 개수 이상 신고된 큐레이션을 확인하고 관리할 수 있습니다.</p>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>신고 기준 설정</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="minReports" className="text-sm">
                            최소 신고 수:
                        </label>
                        <Input
                            id="minReports"
                            type="number"
                            min="1"
                            value={minReports}
                            onChange={handleMinReportsChange}
                            className="w-20"
                        />
                    </div>
                    <Button onClick={fetchReportedCurations}>적용</Button>
                </CardContent>
            </Card>

            {reportedCurations.length > 0 ? (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>큐레이션 ID</TableHead>
                                <TableHead className="text-right">작업</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportedCurations.map((id) => (
                                <TableRow key={id}>
                                    <TableCell className="font-medium flex items-center">
                                        <Flag className="h-4 w-4 mr-2 text-red-500" />
                                        큐레이션 #{id}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Link href={`/curation/${id}`} target="_blank">
                                                <Button variant="outline" size="sm">
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteCuration(id)}
                                                disabled={isDeleting}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="flex items-center p-4 bg-yellow-50 rounded-md text-yellow-800">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <p>현재 신고된 큐레이션이 없습니다.</p>
                </div>
            )}
        </div>
    )
}

