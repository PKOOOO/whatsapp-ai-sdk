import { PrismaClient } from "@prisma/client"
import { config } from "dotenv"
import path from "node:path"

// Load .env.local
config({ path: path.join(__dirname, "..", ".env.local") })

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
})

async function main() {
    console.log("🌱 Seeding database...")

    // Create default BotSettings
    const existing = await prisma.botSettings.findFirst()
    if (!existing) {
        await prisma.botSettings.create({
            data: {
                botName: "AI Assistant",
                systemPrompt:
                    "You are a helpful AI assistant on WhatsApp. Be friendly, concise, and helpful. Use emojis occasionally to keep the conversation engaging.",
                welcomeMessage:
                    "Hello! 👋 I'm your AI assistant. How can I help you today?",
                maxTokens: 1024,
                isActive: true,
            },
        })
        console.log("✅ Created default BotSettings")
    } else {
        console.log("⏭️  BotSettings already exist, skipping")
    }

    console.log("🌱 Seeding complete!")
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
