import { cn } from "@/lib/utils"
import { Image, MessageSquare } from "lucide-react"

interface ChatBubbleProps {
    content: string | null
    direction: "INBOUND" | "OUTBOUND"
    type: "TEXT" | "IMAGE"
    imageUrl?: string | null
    timestamp: string
}

export default function ChatBubble({
    content,
    direction,
    type,
    imageUrl,
    timestamp,
}: ChatBubbleProps) {
    const isInbound = direction === "INBOUND"

    return (
        <div
            className={cn("flex w-full", isInbound ? "justify-start" : "justify-end")}
        >
            <div
                className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-3 space-y-1.5",
                    isInbound
                        ? "bg-zinc-800 rounded-tl-md"
                        : "bg-emerald-600/90 rounded-tr-md"
                )}
            >
                {/* Type indicator */}
                <div className="flex items-center gap-1.5">
                    {type === "IMAGE" ? (
                        <Image
                            className={cn(
                                "h-3 w-3",
                                isInbound ? "text-zinc-500" : "text-emerald-200"
                            )}
                        />
                    ) : (
                        <MessageSquare
                            className={cn(
                                "h-3 w-3",
                                isInbound ? "text-zinc-500" : "text-emerald-200"
                            )}
                        />
                    )}
                    <span
                        className={cn(
                            "text-[10px] uppercase tracking-wider font-medium",
                            isInbound ? "text-zinc-500" : "text-emerald-200"
                        )}
                    >
                        {isInbound ? "Customer" : "Bot"}
                    </span>
                </div>

                {/* Image preview */}
                {type === "IMAGE" && imageUrl && (
                    <div className="rounded-lg overflow-hidden bg-zinc-900/50 p-1">
                        <div className="flex items-center justify-center h-32 rounded bg-zinc-900 text-zinc-500 text-xs">
                            📷 Image attachment
                        </div>
                    </div>
                )}

                {/* Content */}
                <p
                    className={cn(
                        "text-sm leading-relaxed whitespace-pre-wrap break-words",
                        isInbound ? "text-zinc-200" : "text-white"
                    )}
                >
                    {content || "[No text content]"}
                </p>

                {/* Timestamp */}
                <p
                    className={cn(
                        "text-[10px]",
                        isInbound ? "text-zinc-600" : "text-emerald-200/60"
                    )}
                >
                    {new Date(timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </p>
            </div>
        </div>
    )
}
