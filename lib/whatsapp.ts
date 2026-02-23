import axios from "axios"

const BASE_URL = "https://graph.facebook.com/v19.0"
const TOKEN = process.env.WHATSAPP_TOKEN!
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!

function getHeaders() {
    return {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
    }
}

export async function sendTextMessage(to: string, text: string) {
    try {
        const response = await axios.post(
            `${BASE_URL}/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to,
                type: "text",
                text: { body: text },
            },
            { headers: getHeaders() }
        )
        return response.data
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Error sending WhatsApp message:`,
            error
        )
        throw error
    }
}

export async function markAsRead(messageId: string) {
    try {
        await axios.post(
            `${BASE_URL}/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                status: "read",
                message_id: messageId,
            },
            { headers: getHeaders() }
        )
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Error marking message as read:`,
            error
        )
    }
}

export async function getMediaUrl(mediaId: string): Promise<string> {
    try {
        const response = await axios.get(`${BASE_URL}/${mediaId}`, {
            headers: getHeaders(),
        })
        return response.data.url
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Error getting media URL:`,
            error
        )
        throw error
    }
}

export async function downloadMedia(mediaUrl: string): Promise<string> {
    try {
        const response = await axios.get(mediaUrl, {
            headers: { Authorization: `Bearer ${TOKEN}` },
            responseType: "arraybuffer",
        })
        const base64 = Buffer.from(response.data, "binary").toString("base64")
        return base64
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Error downloading media:`,
            error
        )
        throw error
    }
}
