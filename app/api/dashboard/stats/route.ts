import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const totalCustomers = await prisma.customer.count()

        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)

        const messagesToday = await prisma.message.count({
            where: { createdAt: { gte: todayStart } },
        })

        const activeConversations = await prisma.conversation.count({
            where: { isActive: true },
        })

        const settings = await prisma.botSettings.findFirst()
        const botStatus = settings?.isActive ?? true

        // Messages per day for last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const messages = await prisma.message.findMany({
            where: { createdAt: { gte: sevenDaysAgo } },
            select: { createdAt: true },
        })

        const messagesPerDay: Record<string, number> = {}
        for (let i = 6; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const key = date.toISOString().split("T")[0]
            messagesPerDay[key] = 0
        }

        messages.forEach((msg) => {
            const key = msg.createdAt.toISOString().split("T")[0]
            if (messagesPerDay[key] !== undefined) {
                messagesPerDay[key]++
            }
        })

        const messagesLast7Days = Object.entries(messagesPerDay).map(
            ([date, count]) => ({
                date,
                count,
            })
        )

        return NextResponse.json({
            totalCustomers,
            messagesToday,
            activeConversations,
            botStatus,
            messagesLast7Days,
        })
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Stats error:`, error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
