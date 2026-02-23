"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { MessageSquare, Image } from "lucide-react"

interface ConversationRow {
    id: string
    customerId: string
    startedAt: string
    lastMessageAt: string
    messageCount: number
    isActive: boolean
    customer: {
        id: string
        phoneNumber: string
        name: string | null
    }
    messages?: {
        content: string | null
        type: string
        direction: string
    }[]
}

interface ConversationTableProps {
    conversations: ConversationRow[]
    compact?: boolean
}

export default function ConversationTable({
    conversations,
    compact = false,
}: ConversationTableProps) {
    return (
        <div className="rounded-lg border border-zinc-800 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400 font-medium">Customer</TableHead>
                        {!compact && (
                            <TableHead className="text-zinc-400 font-medium">Last Message</TableHead>
                        )}
                        <TableHead className="text-zinc-400 font-medium">Messages</TableHead>
                        <TableHead className="text-zinc-400 font-medium">
                            {compact ? "Date" : "Last Activity"}
                        </TableHead>
                        <TableHead className="text-zinc-400 font-medium">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {conversations.length === 0 ? (
                        <TableRow className="border-zinc-800">
                            <TableCell
                                colSpan={compact ? 4 : 5}
                                className="text-center py-8 text-zinc-500"
                            >
                                No conversations yet
                            </TableCell>
                        </TableRow>
                    ) : (
                        conversations.map((conv) => {
                            const lastMessage = conv.messages?.[0]
                            return (
                                <TableRow
                                    key={conv.id}
                                    className="border-zinc-800 hover:bg-zinc-800/30 cursor-pointer transition-colors"
                                >
                                    <TableCell>
                                        <Link
                                            href={`/dashboard/conversations/${conv.id}`}
                                            className="block"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-zinc-200">
                                                    {conv.customer.name || "Unknown"}
                                                </p>
                                                <p className="text-xs text-zinc-500 font-mono">
                                                    {conv.customer.phoneNumber}
                                                </p>
                                            </div>
                                        </Link>
                                    </TableCell>
                                    {!compact && (
                                        <TableCell>
                                            <Link
                                                href={`/dashboard/conversations/${conv.id}`}
                                                className="block"
                                            >
                                                <div className="flex items-center gap-1.5 max-w-[200px]">
                                                    {lastMessage?.type === "IMAGE" ? (
                                                        <Image className="h-3 w-3 text-zinc-500 shrink-0" />
                                                    ) : (
                                                        <MessageSquare className="h-3 w-3 text-zinc-500 shrink-0" />
                                                    )}
                                                    <span className="text-sm text-zinc-400 truncate">
                                                        {lastMessage?.content || "—"}
                                                    </span>
                                                </div>
                                            </Link>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <Link
                                            href={`/dashboard/conversations/${conv.id}`}
                                            className="block"
                                        >
                                            <span className="text-sm text-zinc-400">
                                                {conv.messageCount}
                                            </span>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link
                                            href={`/dashboard/conversations/${conv.id}`}
                                            className="block"
                                        >
                                            <span className="text-sm text-zinc-500">
                                                {new Date(conv.lastMessageAt).toLocaleDateString()}
                                            </span>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={conv.isActive ? "default" : "secondary"}
                                            className={
                                                conv.isActive
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                                            }
                                        >
                                            {conv.isActive ? "Active" : "Closed"}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
