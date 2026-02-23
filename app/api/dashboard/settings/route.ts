import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        let settings = await prisma.botSettings.findFirst()
        if (!settings) {
            settings = await prisma.botSettings.create({ data: {} })
        }
        return NextResponse.json(settings)
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Settings GET error:`,
            error
        )
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { botName, systemPrompt, welcomeMessage, maxTokens, isActive } = body

        let settings = await prisma.botSettings.findFirst()

        if (settings) {
            settings = await prisma.botSettings.update({
                where: { id: settings.id },
                data: {
                    botName,
                    systemPrompt,
                    welcomeMessage,
                    maxTokens,
                    isActive,
                },
            })
        } else {
            settings = await prisma.botSettings.create({
                data: {
                    botName,
                    systemPrompt,
                    welcomeMessage,
                    maxTokens,
                    isActive,
                },
            })
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Settings POST error:`,
            error
        )
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
