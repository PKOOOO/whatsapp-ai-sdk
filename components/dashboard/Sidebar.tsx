"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    BarChart3,
    Settings,
    Bot,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Conversations", href: "/dashboard/conversations", icon: MessageSquare },
    { label: "Customers", href: "/dashboard/customers", icon: Users },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface SidebarProps {
    botActive?: boolean
    onClose?: () => void
}

export default function DashboardSidebar({ botActive = true, onClose }: SidebarProps) {
    const pathname = usePathname()

    return (
        <div className="flex h-full flex-col bg-zinc-950 border-r border-zinc-800">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-800">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Bot className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-zinc-100">WhatsApp AI</h2>
                    <p className="text-xs text-zinc-500">Admin Dashboard</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Bot Status */}
            <div className="px-4 py-4 border-t border-zinc-800">
                <div className="flex items-center gap-2 px-3 py-2">
                    <div
                        className={cn(
                            "h-2.5 w-2.5 rounded-full",
                            botActive
                                ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                                : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]"
                        )}
                    />
                    <span className="text-xs text-zinc-400">
                        Bot {botActive ? "Online" : "Offline"}
                    </span>
                </div>
            </div>
        </div>
    )
}
