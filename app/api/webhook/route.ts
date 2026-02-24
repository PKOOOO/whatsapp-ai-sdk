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
        console.log(`[${new Date().toISOString()}] [WEBHOOK] ====== INCOMING WEBHOOK ======`)
        console.log(`[${new Date().toISOString()}] [WEBHOOK] Full body: ${JSON.stringify(body).substring(0, 500)}`)

        const entry = body?.entry?.[0]
        const changes = entry?.changes?.[0]
        const value = changes?.value
        const message = value?.messages?.[0]

        if (!message) {
            console.log(`[${new Date().toISOString()}] [WEBHOOK] No message in payload (status update or other event), skipping.`)
            return NextResponse.json({ status: "ok" }, { status: 200 })
        }

        const from = message.from
        const messageId = message.id
        const type = message.type

        console.log(`[${new Date().toISOString()}] [WEBHOOK] 📩 Message received!`)
        console.log(`[${new Date().toISOString()}] [WEBHOOK] From: ${from}`)
        console.log(`[${new Date().toISOString()}] [WEBHOOK] Message ID: ${messageId}`)
        console.log(`[${new Date().toISOString()}] [WEBHOOK] Type: ${type}`)

        // Validate phone number format
        if (from.startsWith("+")) {
            console.warn(`[${new Date().toISOString()}] [WEBHOOK] ⚠️ Phone number starts with '+': ${from}. Should be without '+' sign.`)
        }
        console.log(`[${new Date().toISOString()}] [WEBHOOK] Phone number format check: length=${from.length}, startsWithPlus=${from.startsWith("+")}, value=${from}`)

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
            console.log(`[${new Date().toISOString()}] [WEBHOOK] New customer created: ${customer.id}`)
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
            console.log(`[${new Date().toISOString()}] [WEBHOOK] 📝 Text message: "${textBody.substring(0, 200)}"`)

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
                console.log(`[${new Date().toISOString()}] [WEBHOOK] 🤖 Calling Claude...`)
                aiResponse = await askClaude(textBody)
                console.log(`[${new Date().toISOString()}] [WEBHOOK] 🤖 Claude response received! Length: ${aiResponse.length}`)
                console.log(`[${new Date().toISOString()}] [WEBHOOK] 🤖 Claude response: "${aiResponse.substring(0, 300)}"`)
            } catch (error) {
                console.error(
                    `[${new Date().toISOString()}] [WEBHOOK] ❌ Claude error:`,
                    error
                )
                aiResponse =
                    "Sorry, I'm having trouble right now. Please try again in a moment! 🙏"
            }

            // Send reply
            console.log(`[${new Date().toISOString()}] [WEBHOOK] 📤 About to call sendTextMessage()...`)
            console.log(`[${new Date().toISOString()}] [WEBHOOK] 📤 Sending to: ${from}`)
            console.log(`[${new Date().toISOString()}] [WEBHOOK] 📤 Message: "${aiResponse.substring(0, 200)}"`)
            try {
                const sendResult = await sendTextMessage(from, aiResponse)
                console.log(`[${new Date().toISOString()}] [WEBHOOK] ✅ sendTextMessage() completed successfully!`)
                console.log(`[${new Date().toISOString()}] [WEBHOOK] ✅ Send result: ${JSON.stringify(sendResult)}`)
            } catch (sendError: any) {
                console.error(`[${new Date().toISOString()}] [WEBHOOK] ❌ sendTextMessage() FAILED!`)
                console.error(`[${new Date().toISOString()}] [WEBHOOK] ❌ Send error: ${sendError?.message}`)
                console.error(`[${new Date().toISOString()}] [WEBHOOK] ❌ Send error response: ${JSON.stringify(sendError?.response?.data)}`)
            }

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
            console.log(`[${new Date().toISOString()}] [WEBHOOK] 🖼️ Image message. ID: ${imageId}, caption: ${caption ?? "none"}`)

            let imageUrl = ""
            let base64Image = ""

            try {
                imageUrl = await getMediaUrl(imageId)
                base64Image = await downloadMedia(imageUrl)
                console.log(`[${new Date().toISOString()}] [WEBHOOK] 🖼️ Image downloaded. Base64 length: ${base64Image.length}`)
            } catch (error) {
                console.error(
                    `[${new Date().toISOString()}] [WEBHOOK] ❌ Media download error:`,
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
                    console.log(`[${new Date().toISOString()}] [WEBHOOK] 🤖 Calling Claude with image...`)
                    aiResponse = await askClaudeWithImage(
                        base64Image,
                        mimeType,
                        caption
                    )
                    console.log(`[${new Date().toISOString()}] [WEBHOOK] 🤖 Claude image response: "${aiResponse.substring(0, 300)}"`)
                } else {
                    aiResponse =
                        "I received your image but couldn't process it. Could you try sending it again?"
                }
            } catch (error) {
                console.error(
                    `[${new Date().toISOString()}] [WEBHOOK] ❌ Claude image error:`,
                    error
                )
                aiResponse =
                    "Sorry, I'm having trouble right now. Please try again in a moment! 🙏"
            }

            // Send reply
            console.log(`[${new Date().toISOString()}] [WEBHOOK] 📤 About to call sendTextMessage() for image reply...`)
            console.log(`[${new Date().toISOString()}] [WEBHOOK] 📤 Sending to: ${from}`)
            try {
                const sendResult = await sendTextMessage(from, aiResponse)
                console.log(`[${new Date().toISOString()}] [WEBHOOK] ✅ sendTextMessage() completed successfully!`)
                console.log(`[${new Date().toISOString()}] [WEBHOOK] ✅ Send result: ${JSON.stringify(sendResult)}`)
            } catch (sendError: any) {
                console.error(`[${new Date().toISOString()}] [WEBHOOK] ❌ sendTextMessage() FAILED!`)
                console.error(`[${new Date().toISOString()}] [WEBHOOK] ❌ Send error: ${sendError?.message}`)
                console.error(`[${new Date().toISOString()}] [WEBHOOK] ❌ Send error response: ${JSON.stringify(sendError?.response?.data)}`)
            }

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

        console.log(`[${new Date().toISOString()}] [WEBHOOK] ====== WEBHOOK PROCESSING COMPLETE ======`)
    } catch (error: any) {
        console.error(
            `[${new Date().toISOString()}] [WEBHOOK] ❌❌ UNHANDLED WEBHOOK ERROR:`,
            error?.message
        )
        console.error(
            `[${new Date().toISOString()}] [WEBHOOK] ❌❌ Stack:`,
            error?.stack
        )
    }

    return NextResponse.json({ status: "ok" }, { status: 200 })
}
