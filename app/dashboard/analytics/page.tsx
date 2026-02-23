"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    MessagesLineChart,
    DirectionBarChart,
    TypePieChart,
} from "@/components/dashboard/Charts"
import { Loader2 } from "lucide-react"

interface AnalyticsData {
    messagesPerDay: { date: string; count: number }[]
    directionChart: { name: string; value: number }[]
    typeChart: { name: string; value: number }[]
    topCustomers: { name: string; phoneNumber: string; messages: number }[]
}

const rangeOptions = [
    { label: "7 Days", value: 7 },
    { label: "30 Days", value: 30 },
    { label: "90 Days", value: 90 },
]

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [days, setDays] = useState(30)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        fetch(`/api/dashboard/analytics?days=${days}`)
            .then((r) => r.json())
            .then((d) => setData(d))
            .catch((e) => console.error("Analytics error:", e))
            .finally(() => setLoading(false))
    }, [days])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Date Range Selector */}
            <div className="flex gap-2">
                {rangeOptions.map((opt) => (
                    <Button
                        key={opt.value}
                        variant={days === opt.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDays(opt.value)}
                        className={
                            days === opt.value
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                        }
                    >
                        {opt.label}
                    </Button>
                ))}
            </div>

            {/* Messages Per Day */}
            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-zinc-100 text-base">
                        Messages Per Day
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <MessagesLineChart data={data?.messagesPerDay || []} />
                </CardContent>
            </Card>

            {/* Direction + Type Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-zinc-100 text-base">
                            Inbound vs Outbound
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DirectionBarChart data={data?.directionChart || []} />
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-zinc-100 text-base">
                            Text vs Image
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TypePieChart data={data?.typeChart || []} />
                    </CardContent>
                </Card>
            </div>

            {/* Top Customers */}
            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-zinc-100 text-base">
                        Top 10 Most Active Customers
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border border-zinc-800 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800 hover:bg-transparent">
                                    <TableHead className="text-zinc-400 font-medium w-12">
                                        #
                                    </TableHead>
                                    <TableHead className="text-zinc-400 font-medium">
                                        Customer
                                    </TableHead>
                                    <TableHead className="text-zinc-400 font-medium">
                                        Phone
                                    </TableHead>
                                    <TableHead className="text-zinc-400 font-medium text-right">
                                        Messages
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(data?.topCustomers || []).length === 0 ? (
                                    <TableRow className="border-zinc-800">
                                        <TableCell
                                            colSpan={4}
                                            className="text-center py-8 text-zinc-500"
                                        >
                                            No data available
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.topCustomers.map((customer, i) => (
                                        <TableRow
                                            key={i}
                                            className="border-zinc-800 hover:bg-zinc-800/30"
                                        >
                                            <TableCell className="text-zinc-500 font-medium">
                                                {i + 1}
                                            </TableCell>
                                            <TableCell className="text-sm text-zinc-200">
                                                {customer.name}
                                            </TableCell>
                                            <TableCell className="text-sm font-mono text-zinc-400">
                                                {customer.phoneNumber}
                                            </TableCell>
                                            <TableCell className="text-sm text-right">
                                                <span className="text-emerald-400 font-medium">
                                                    {customer.messages}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
