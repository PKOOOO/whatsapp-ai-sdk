import axios from "axios"

const BASE_URL = "https://graph.facebook.com/v19.0"

function getConfig() {
    const token = process.env.WHATSAPP_TOKEN
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

    if (!token || !phoneNumberId) {
        console.error(`[${new Date().toISOString()}] WhatsApp config missing: token=${!!token}, phoneNumberId=${!!phoneNumberId}`)
    }

    return { token: token!, phoneNumberId: phoneNumberId! }
}

function getHeaders() {
    const { token } = getConfig()
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    }
}

export async function sendTextMessage(to: string, text: string) {
    const { token, phoneNumberId } = getConfig()
    const url = `${BASE_URL}/${phoneNumberId}/messages`

    const response = await axios.post(
        url,
        {
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { body: text },
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    )
    return response.data
}

export async function markAsRead(messageId: string) {
    const { phoneNumberId } = getConfig()
    try {
        await axios.post(
            `${BASE_URL}/${phoneNumberId}/messages`,
            {
                messaging_product: "whatsapp",
                status: "read",
                message_id: messageId,
            },
            { headers: getHeaders() }
        )
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error marking message as read:`, error)
    }
}

export async function getMediaUrl(mediaId: string): Promise<string> {
    const { token } = getConfig()
    const response = await axios.get(`${BASE_URL}/${mediaId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    })
    return response.data.url
}

export async function downloadMedia(mediaUrl: string): Promise<string> {
    const { token } = getConfig()
    const response = await axios.get(mediaUrl, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "arraybuffer",
    })
    const base64 = Buffer.from(response.data, "binary").toString("base64")
    return base64
}
