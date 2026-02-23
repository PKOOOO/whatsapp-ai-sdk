import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")
        const search = searchParams.get("search") || ""

        const where = search
            ? {
                customer: {
                    OR: [
                        { phoneNumber: { contains: search } },
                        { name: { contains: search, mode: "insensitive" as const } },
                    ],
                },
            }
            : {}

        const total = await prisma.conversation.count({ where })

        const conversations = await prisma.conversation.findMany({
            where,
            include: {
                customer: true,
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
            orderBy: { lastMessageAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        })

        return NextResponse.json({
            conversations,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        })
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Conversations error:`,
            error
        )
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
