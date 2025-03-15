"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Trash2, ExternalLink, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

// 멤버 타입 정의
interface Member {
    id: number
    memberId: string
    username: string
    email: string
    profileImage?: string
    role: "ADMIN" | "MEMBER"
    createdDate: string
}

// 큐레이션 타입 정의
interface Curation {
    id: number
    title: string
    authorName: string
    createdAt: string
    likeCount: number
    viewCount: number
}

export default function AdminDashboardPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [isAdmin, setIsAdmin] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [members, setMembers] = useState<Member[]>([])
    const [curations, setCurations] = useState<Curation[]>([])
    const [memberSearchTerm, setMemberSearchTerm] = useState("")
    const [curationSearchTerm, setCurationSearchTerm] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)
    const [activeTab, setActiveTab] = useState("members")

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

            // 데이터 로드
            try {
                // 멤버 데이터
                const mockMembers: Member[] = [
                    {
                        id: 1,
                        memberId: "admin",
                        username: "관리자",
                        email: "admin@example.com",
                        profileImage: "/placeholder.svg?height=40&width=40",
                        role: "ADMIN",
                        createdDate: new Date(2023, 0, 1).toISOString(),
                    },
                    ...Array.from({ length: 9 }, (_, i) => ({
                        id: i + 2,
                        memberId: `user${i + 1}`,
                        username: `사용자 ${i + 1}`,
                        email: `user${i + 1}@example.com`,
                        profileImage: `/placeholder.svg?height=40&width=40`,
                        role: "MEMBER" as const,
                        createdDate: new Date(2023, i % 12, (i % 28) + 1).toISOString(),
                    })),
                ]
                setMembers(mockMembers)

                // 큐레이션 데이터
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
                console.error("데이터 로드 오류:", error)
                toast({
                    title: "데이터 로드 실패",
                    description: "데이터를 불러오는데 실패했습니다.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        checkAdminAndFetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // 의존성 배열을 비워서 컴포넌트 마운트 시 한 번만 실행되도록 함

    // 멤버 삭제 함수
    const handleDeleteMember = async (id: number, username: string) => {
        if (!confirm(`정말로 멤버 "${username}"을(를) 삭제하시겠습니까?`)) {
            return
        }

        setIsDeleting(true)

        try {
            const response = await fetch(`http://localhost:8080/api/v1/admin/members/${id}`, {
                method: "DELETE",
                credentials: "include",
            })

            if (!response.ok) {
                throw new Error("멤버 삭제에 실패했습니다.")
            }

            // 삭제 성공 시 목록에서 제거
            setMembers(members.filter((member) => member.id !== id))

            toast({
                title: "삭제 성공",
                description: `멤버 "${username}"이(가) 성공적으로 삭제되었습니다.`,
            })
        } catch (error) {
            console.error("멤버 삭제 오류:", error)
            toast({
                title: "삭제 실패",
                description: "멤버를 삭제하는데 실패했습니다.",
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
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

    // 멤버 검색 필터링
    const filteredMembers = members.filter(
        (member) =>
            member.username.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
            member.memberId.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(memberSearchTerm.toLowerCase()),
    )

    // 큐레이션 검색 필터링
    const filteredCurations = curations.filter(
        (curation) =>
            curation.title.toLowerCase().includes(curationSearchTerm.toLowerCase()) ||
            curation.authorName.toLowerCase().includes(curationSearchTerm.toLowerCase()) ||
            curation.id.toString().includes(curationSearchTerm),
    )

    // 날짜 형식화 함수
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
    }

    // 큐레이션 날짜 형식화 함수
    const formatCurationDate = (dateString: string) => {
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
                <h1 className="text-3xl font-bold mb-2">관리자 대시보드</h1>
                <p className="text-gray-500">멤버와 큐레이션을 관리할 수 있습니다.</p>
            </div>

            <Tabs defaultValue="members" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="members">멤버 관리</TabsTrigger>
                    <TabsTrigger value="curations">큐레이션 관리</TabsTrigger>
                </TabsList>

                {/* 멤버 관리 탭 */}
                <TabsContent value="members">
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>멤버 검색</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Input
                                placeholder="이름, 아이디 또는 이메일로 검색"
                                value={memberSearchTerm}
                                onChange={(e) => setMemberSearchTerm(e.target.value)}
                                className="max-w-md"
                            />
                        </CardContent>
                    </Card>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>프로필</TableHead>
                                    <TableHead>아이디</TableHead>
                                    <TableHead>이름</TableHead>
                                    <TableHead>이메일</TableHead>
                                    <TableHead>권한</TableHead>
                                    <TableHead>가입일</TableHead>
                                    <TableHead className="text-right">작업</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMembers.length > 0 ? (
                                    filteredMembers.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>{member.id}</TableCell>
                                            <TableCell>
                                                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                                                    {member.profileImage ? (
                                                        <Image
                                                            src={member.profileImage || "/placeholder.svg"}
                                                            alt={member.username}
                                                            width={40}
                                                            height={40}
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full">
                                                            <User className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{member.memberId}</TableCell>
                                            <TableCell className="font-medium">{member.username}</TableCell>
                                            <TableCell>{member.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={member.role === "ADMIN" ? "default" : "secondary"}>
                                                    {member.role === "ADMIN" ? "관리자" : "일반회원"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatDate(member.createdDate)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteMember(member.id, member.username)}
                                                    disabled={isDeleting || member.role === "ADMIN"}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-4">
                                            검색 결과가 없습니다.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                {/* 큐레이션 관리 탭 */}
                <TabsContent value="curations">
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>큐레이션 검색</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Input
                                placeholder="제목, 작성자 또는 ID로 검색"
                                value={curationSearchTerm}
                                onChange={(e) => setCurationSearchTerm(e.target.value)}
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
                                    filteredCurations.map((curation) => (
                                        <TableRow key={curation.id}>
                                            <TableCell>{curation.id}</TableCell>
                                            <TableCell className="font-medium">{curation.title}</TableCell>
                                            <TableCell>{curation.authorName}</TableCell>
                                            <TableCell>{formatCurationDate(curation.createdAt)}</TableCell>
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
                                    ))
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
                </TabsContent>
            </Tabs>
        </div>
    )
}

