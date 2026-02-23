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
        const days = parseInt(searchParams.get("days") || "30")

        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        type AnalyticsMessage = {
            direction: string
            type: string
            createdAt: Date
            customerId: string
        }

        const messages: AnalyticsMessage[] = await prisma.message.findMany({
            where: { createdAt: { gte: startDate } },
            select: {
                direction: true,
                type: true,
                createdAt: true,
                customerId: true,
            },
        })

        // Messages per day
        const messagesPerDay: Record<string, number> = {}
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            messagesPerDay[date.toISOString().split("T")[0]] = 0
        }

        messages.forEach((msg: AnalyticsMessage) => {
            const key = msg.createdAt.toISOString().split("T")[0]
            if (messagesPerDay[key] !== undefined) {
                messagesPerDay[key]++
            }
        })

        const messagesPerDayChart = Object.entries(messagesPerDay).map(
            ([date, count]) => ({ date, count })
        )

        // Inbound vs Outbound
        const inbound = messages.filter((m: AnalyticsMessage) => m.direction === "INBOUND").length
        const outbound = messages.filter((m: AnalyticsMessage) => m.direction === "OUTBOUND").length
        const directionChart = [
            { name: "Inbound", value: inbound },
            { name: "Outbound", value: outbound },
        ]

        // Image vs Text
        const textCount = messages.filter((m: AnalyticsMessage) => m.type === "TEXT").length
        const imageCount = messages.filter((m: AnalyticsMessage) => m.type === "IMAGE").length
        const typeChart = [
            { name: "Text", value: textCount },
            { name: "Image", value: imageCount },
        ]

        // Top 10 most active customers
        const customerMessageCount: Record<string, number> = {}
        messages.forEach((msg: AnalyticsMessage) => {
            customerMessageCount[msg.customerId] =
                (customerMessageCount[msg.customerId] || 0) + 1
        })

        const topCustomerIds = Object.entries(customerMessageCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([id]) => id)

        const topCustomers = await prisma.customer.findMany({
            where: { id: { in: topCustomerIds } },
            select: { id: true, phoneNumber: true, name: true },
        })

        type CustomerInfo = { id: string; phoneNumber: string; name: string | null }

        const topCustomersChart = topCustomerIds.map((id: string) => {
            const customer = topCustomers.find((c: CustomerInfo) => c.id === id)
            return {
                name: customer?.name || customer?.phoneNumber || "Unknown",
                phoneNumber: customer?.phoneNumber || "",
                messages: customerMessageCount[id],
            }
        })

        return NextResponse.json({
            messagesPerDay: messagesPerDayChart,
            directionChart,
            typeChart,
            topCustomers: topCustomersChart,
        })
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Analytics error:`,
            error
        )
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
