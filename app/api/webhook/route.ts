import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { askClaude, askClaudeWithImage } from "@/lib/claude"
import {
    sendTextMessage,
    markAsRead,
    getMediaUrl,
    downloadMedia,
} from "@/lib/whatsapp"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get("hub.mode")
    const token = searchParams.get("hub.verify_token")
    const challenge = searchParams.get("hub.challenge")

    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        return new NextResponse(challenge, { status: 200 })
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const entry = body?.entry?.[0]
        const changes = entry?.changes?.[0]
        const value = changes?.value
        const message = value?.messages?.[0]

        if (!message) {
            return NextResponse.json({ status: "ok" }, { status: 200 })
        }

        const from = message.from
        const messageId = message.id
        const type = message.type

        // Mark as read immediately
        await markAsRead(messageId)

        // Find or create customer
        let customer = await prisma.customer.findUnique({
            where: { phoneNumber: from },
        })

        if (!customer) {
            const contactName = value?.contacts?.[0]?.profile?.name || null
            customer = await prisma.customer.create({
                data: {
                    phoneNumber: from,
                    name: contactName,
                },
            })
        }

        // Find or create active conversation
        let conversation = await prisma.conversation.findFirst({
            where: {
                customerId: customer.id,
                isActive: true,
            },
        })

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    customerId: customer.id,
                },
            })
        }

        if (type === "text") {
            const textBody = message.text?.body || ""

            // Save inbound message
            await prisma.message.create({
                data: {
                    customerId: customer.id,
                    conversationId: conversation.id,
                    direction: "INBOUND",
                    type: "TEXT",
                    content: textBody,
                },
            })

            // Get AI response
            let aiResponse: string
            try {
                aiResponse = await askClaude(textBody)
            } catch (error) {
                console.error(
                    `[${new Date().toISOString()}] Claude error:`,
                    error
                )
                aiResponse =
                    "Sorry, I'm having trouble right now. Please try again in a moment! 🙏"
            }

            // Send reply
            await sendTextMessage(from, aiResponse)

            // Save outbound message
            await prisma.message.create({
                data: {
                    customerId: customer.id,
                    conversationId: conversation.id,
                    direction: "OUTBOUND",
                    type: "TEXT",
                    content: aiResponse,
                },
            })
        } else if (type === "image") {
            const imageId = message.image?.id
            const caption = message.image?.caption || undefined
            const mimeType = message.image?.mime_type || "image/jpeg"

            let imageUrl = ""
            let base64Image = ""

            try {
                imageUrl = await getMediaUrl(imageId)
                base64Image = await downloadMedia(imageUrl)
            } catch (error) {
                console.error(
                    `[${new Date().toISOString()}] Media download error:`,
                    error
                )
            }

            // Save inbound image message
            await prisma.message.create({
                data: {
                    customerId: customer.id,
                    conversationId: conversation.id,
                    direction: "INBOUND",
                    type: "IMAGE",
                    content: caption || "[Image]",
                    imageUrl: imageUrl,
                },
            })

            // Get AI response for image
            let aiResponse: string
            try {
                if (base64Image) {
                    aiResponse = await askClaudeWithImage(
                        base64Image,
                        mimeType,
                        caption
                    )
                } else {
                    aiResponse =
                        "I received your image but couldn't process it. Could you try sending it again?"
                }
            } catch (error) {
                console.error(
                    `[${new Date().toISOString()}] Claude image error:`,
                    error
                )
                aiResponse =
                    "Sorry, I'm having trouble right now. Please try again in a moment! 🙏"
            }

            // Send reply
            await sendTextMessage(from, aiResponse)

            // Save outbound message
            await prisma.message.create({
                data: {
                    customerId: customer.id,
                    conversationId: conversation.id,
                    direction: "OUTBOUND",
                    type: "TEXT",
                    content: aiResponse,
                },
            })
        }

        // Update conversation
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
                lastMessageAt: new Date(),
                messageCount: { increment: type === "text" || type === "image" ? 2 : 0 },
            },
        })
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Webhook error:`,
            error
        )
    }

    return NextResponse.json({ status: "ok" }, { status: 200 })
}
