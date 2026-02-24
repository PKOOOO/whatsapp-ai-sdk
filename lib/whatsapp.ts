import axios from "axios"

const BASE_URL = "https://graph.facebook.com/v19.0"

function getConfig() {
    const token = process.env.WHATSAPP_TOKEN
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

    console.log(`[${new Date().toISOString()}] [WA-CONFIG] WHATSAPP_TOKEN present: ${!!token}, length: ${token?.length ?? 0}`)
    console.log(`[${new Date().toISOString()}] [WA-CONFIG] WHATSAPP_PHONE_NUMBER_ID: ${phoneNumberId ?? "MISSING"}`)

    if (!token) {
        console.error(`[${new Date().toISOString()}] [WA-CONFIG] ❌ WHATSAPP_TOKEN is undefined/empty!`)
    }
    if (!phoneNumberId) {
        console.error(`[${new Date().toISOString()}] [WA-CONFIG] ❌ WHATSAPP_PHONE_NUMBER_ID is undefined/empty!`)
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
    const body = {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
    }

    console.log(`[${new Date().toISOString()}] [WA-SEND] ====== SENDING MESSAGE ======`)
    console.log(`[${new Date().toISOString()}] [WA-SEND] To: ${to}`)
    console.log(`[${new Date().toISOString()}] [WA-SEND] Text length: ${text.length}`)
    console.log(`[${new Date().toISOString()}] [WA-SEND] Text preview: ${text.substring(0, 100)}`)
    console.log(`[${new Date().toISOString()}] [WA-SEND] URL: ${url}`)
    console.log(`[${new Date().toISOString()}] [WA-SEND] Token present: ${!!token}, Token prefix: ${token?.substring(0, 10)}...`)
    console.log(`[${new Date().toISOString()}] [WA-SEND] Request body: ${JSON.stringify(body)}`)

    try {
        const response = await axios.post(
            url,
            body,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        )
        console.log(`[${new Date().toISOString()}] [WA-SEND] ✅ Response status: ${response.status}`)
        console.log(`[${new Date().toISOString()}] [WA-SEND] ✅ Response data: ${JSON.stringify(response.data)}`)
        return response.data
    } catch (error: any) {
        const status = error?.response?.status
        const errorData = error?.response?.data
        console.error(`[${new Date().toISOString()}] [WA-SEND] ❌ Error sending WhatsApp message`)
        console.error(`[${new Date().toISOString()}] [WA-SEND] ❌ HTTP Status: ${status}`)
        console.error(`[${new Date().toISOString()}] [WA-SEND] ❌ Error response body: ${JSON.stringify(errorData)}`)
        console.error(`[${new Date().toISOString()}] [WA-SEND] ❌ Error message: ${error?.message}`)
        if (status === 401) {
            console.error(`[${new Date().toISOString()}] [WA-SEND] ❌❌ 401 UNAUTHORIZED - WHATSAPP_TOKEN is likely EXPIRED or INVALID!`)
        }
        if (status === 400) {
            console.error(`[${new Date().toISOString()}] [WA-SEND] ❌❌ 400 BAD REQUEST - Check phone number format or request body. Error: ${JSON.stringify(errorData?.error)}`)
        }
        throw error
    }
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
        console.error(
            `[${new Date().toISOString()}] Error marking message as read:`,
            error
        )
    }
}

export async function getMediaUrl(mediaId: string): Promise<string> {
    const { token } = getConfig()
    try {
        const response = await axios.get(`${BASE_URL}/${mediaId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
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
    const { token } = getConfig()
    try {
        const response = await axios.get(mediaUrl, {
            headers: { Authorization: `Bearer ${token}` },
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
