import { generateText } from "ai"
import { gateway } from "@ai-sdk/gateway"
import { prisma } from "./prisma"

async function getSettings() {
    let settings = await prisma.botSettings.findFirst()
    if (!settings) {
        settings = await prisma.botSettings.create({ data: {} })
    }
    return settings
}

export async function askClaude(text: string): Promise<string> {
    const settings = await getSettings()
    if (!settings.isActive) {
        return "The bot is currently offline. Please try again later."
    }
    const { text: response } = await generateText({
        model: gateway("anthropic/claude-sonnet-4-20250514"),
        system: settings.systemPrompt,
        prompt: text,
        maxOutputTokens: settings.maxTokens,
    })
    return response
}

export async function askClaudeWithImage(
    base64Image: string,
    mimeType: string = "image/jpeg",
    caption?: string
): Promise<string> {
    const settings = await getSettings()
    if (!settings.isActive) {
        return "The bot is currently offline. Please try again later."
    }

    // Build data URL from base64 + mimeType
    const dataUrl = `data:${mimeType};base64,${base64Image}`

    const { text: response } = await generateText({
        model: gateway("anthropic/claude-sonnet-4-20250514"),
        system: settings.systemPrompt,
        maxOutputTokens: settings.maxTokens,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "image",
                        image: new URL(dataUrl),
                    },
                    {
                        type: "text",
                        text:
                            caption ||
                            "Please analyze this image and describe what you see.",
                    },
                ],
            },
        ],
    })
    return response
}
