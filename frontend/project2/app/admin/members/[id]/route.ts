import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id

        // 백엔드 API 호출
        const response = await fetch(`http://localhost:8080/api/v1/members/${id}`, {
            method: "DELETE",
            credentials: "include",
            cache: "no-store",
            headers: {
                "Cache-Control": "no-cache",
            },
        })

        if (!response.ok) {
            return NextResponse.json({ error: "멤버 삭제에 실패했습니다." }, { status: response.status })
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error("API 프록시 오류:", error)
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
    }
}

