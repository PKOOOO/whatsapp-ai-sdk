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
        const search = searchParams.get("search") || ""

        const where = search
            ? {
                OR: [
                    { phoneNumber: { contains: search } },
                    { name: { contains: search, mode: "insensitive" as const } },
                ],
            }
            : {}

        const customers = await prisma.customer.findMany({
            where,
            include: {
                _count: {
                    select: { messages: true },
                },
                conversations: {
                    orderBy: { lastMessageAt: "desc" },
                    take: 1,
                    select: {
                        id: true,
                        lastMessageAt: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return NextResponse.json({ customers })
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Customers error:`,
            error
        )
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
