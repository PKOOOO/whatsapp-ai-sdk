"use client"

import { useEffect, useState, use } from "react"
import ChatBubble from "@/components/dashboard/ChatBubble"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Phone, Calendar, MessageSquare, Loader2 } from "lucide-react"
import Link from "next/link"

interface Message {
    id: string
    direction: "INBOUND" | "OUTBOUND"
    type: "TEXT" | "IMAGE"
    content: string | null
    imageUrl: string | null
    createdAt: string
}

interface ConversationDetail {
    id: string
    startedAt: string
    lastMessageAt: string
    messageCount: number
    isActive: boolean
    customer: {
        id: string
        phoneNumber: string
        name: string | null
        createdAt: string
    }
    messages: Message[]
}

export default function ConversationDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const [conversation, setConversation] = useState<ConversationDetail | null>(
        null
    )
    const [loading, setLoading] = useState(true)

    const fetchConversation = async () => {
        try {
            const res = await fetch(`/api/dashboard/conversations/${id}`)
            const data = await res.json()
            setConversation(data)
        } catch (error) {
            console.error("Failed to fetch conversation:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchConversation()
        const interval = setInterval(fetchConversation, 5000)
        return () => clearInterval(interval)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        )
    }

    if (!conversation) {
        return (
            <div className="text-center py-12">
                <p className="text-zinc-400">Conversation not found</p>
                <Link href="/dashboard/conversations">
                    <Button variant="outline" className="mt-4 border-zinc-800 text-zinc-300">
                        Back to Conversations
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-4 max-w-4xl mx-auto">
            {/* Back button */}
            <Link href="/dashboard/conversations">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-400 hover:text-zinc-100"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Conversations
                </Button>
            </Link>

            {/* Customer Info */}
            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <span className="text-emerald-400 font-bold text-lg">
                                    {(conversation.customer.name || "?")[0].toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-100">
                                    {conversation.customer.name || "Unknown Customer"}
                                </h3>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className="flex items-center gap-1 text-sm text-zinc-400">
                                        <Phone className="h-3 w-3" />
                                        {conversation.customer.phoneNumber}
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-zinc-500">
                                        <Calendar className="h-3 w-3" />
                                        Joined {new Date(conversation.customer.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge
                                className={
                                    conversation.isActive
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : "bg-zinc-800 text-zinc-400 border-zinc-700"
                                }
                            >
                                {conversation.isActive ? "Active" : "Closed"}
                            </Badge>
                            <span className="flex items-center gap-1 text-sm text-zinc-500">
                                <MessageSquare className="h-3 w-3" />
                                {conversation.messageCount} messages
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Chat */}
            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader className="pb-0">
                    <CardTitle className="text-zinc-100 text-sm font-medium">
                        Messages
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <ScrollArea className="h-[60vh]">
                        <div className="space-y-4 p-2">
                            {conversation.messages.length === 0 ? (
                                <p className="text-center text-zinc-500 py-8">
                                    No messages yet
                                </p>
                            ) : (
                                conversation.messages.map((msg) => (
                                    <ChatBubble
                                        key={msg.id}
                                        content={msg.content}
                                        direction={msg.direction}
                                        type={msg.type}
                                        imageUrl={msg.imageUrl}
                                        timestamp={msg.createdAt}
                                    />
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}
