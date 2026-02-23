import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { id } = await params

        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: {
                customer: true,
                messages: {
                    orderBy: { createdAt: "asc" },
                },
            },
        })

        if (!conversation) {
            return NextResponse.json(
                { error: "Conversation not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(conversation)
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Conversation detail error:`,
            error
        )
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
