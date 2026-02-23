"use client"

import { useEffect, useState } from "react"
import StatsCard from "@/components/dashboard/StatsCard"
import ConversationTable from "@/components/dashboard/ConversationTable"
import { MessagesLineChart } from "@/components/dashboard/Charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Users, MessageSquare, MessagesSquare, Bot, Loader2 } from "lucide-react"

interface StatsData {
    totalCustomers: number
    messagesToday: number
    activeConversations: number
    botStatus: boolean
    messagesLast7Days: { date: string; count: number }[]
}

export default function DashboardOverview() {
    const [stats, setStats] = useState<StatsData | null>(null)
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(true)
    const [toggling, setToggling] = useState(false)

    const fetchData = async () => {
        try {
            const [statsRes, convsRes] = await Promise.all([
                fetch("/api/dashboard/stats"),
                fetch("/api/dashboard/conversations?limit=5"),
            ])
            const statsData = await statsRes.json()
            const convsData = await convsRes.json()
            setStats(statsData)
            setConversations(convsData.conversations || [])
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const toggleBot = async () => {
        if (!stats || toggling) return
        setToggling(true)
        try {
            const res = await fetch("/api/dashboard/settings")
            const settings = await res.json()

            await fetch("/api/dashboard/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...settings, isActive: !stats.botStatus }),
            })

            setStats({ ...stats, botStatus: !stats.botStatus })
        } catch (error) {
            console.error("Failed to toggle bot:", error)
        } finally {
            setToggling(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Customers"
                    value={stats?.totalCustomers || 0}
                    icon={Users}
                    variant="default"
                />
                <StatsCard
                    title="Messages Today"
                    value={stats?.messagesToday || 0}
                    icon={MessageSquare}
                    variant="success"
                />
                <StatsCard
                    title="Active Conversations"
                    value={stats?.activeConversations || 0}
                    icon={MessagesSquare}
                    variant="default"
                />
                <StatsCard
                    title="Bot Status"
                    value={stats?.botStatus ? "Online" : "Offline"}
                    icon={Bot}
                    variant={stats?.botStatus ? "success" : "danger"}
                >
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={stats?.botStatus}
                            onCheckedChange={toggleBot}
                            disabled={toggling}
                            className="data-[state=checked]:bg-emerald-600"
                        />
                        <span className="text-xs text-zinc-400">
                            {stats?.botStatus ? "Enabled" : "Disabled"}
                        </span>
                    </div>
                </StatsCard>
            </div>

            {/* Messages Chart */}
            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-zinc-100 text-base">
                        Messages — Last 7 Days
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <MessagesLineChart data={stats?.messagesLast7Days || []} />
                </CardContent>
            </Card>

            {/* Recent Conversations */}
            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-zinc-100 text-base">
                        Recent Conversations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ConversationTable conversations={conversations} compact />
                </CardContent>
            </Card>
        </div>
    )
}
