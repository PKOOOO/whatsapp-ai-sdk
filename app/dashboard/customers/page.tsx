"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Search, MessageSquare, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"

interface Customer {
    id: string
    phoneNumber: string
    name: string | null
    createdAt: string
    _count: { messages: number }
    conversations: { id: string; lastMessageAt: string }[]
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)

    const fetchCustomers = async (query: string = "") => {
        setLoading(true)
        try {
            const params = query ? `?search=${encodeURIComponent(query)}` : ""
            const res = await fetch(`/api/dashboard/customers${params}`)
            const data = await res.json()
            setCustomers(data.customers || [])
        } catch (error) {
            console.error("Failed to fetch customers:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCustomers()
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchCustomers(search)
    }

    return (
        <div className="space-y-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search by phone or name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-emerald-500/50"
                    />
                </div>
                <Button
                    type="submit"
                    variant="outline"
                    className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                >
                    Search
                </Button>
            </form>

            {/* Table */}
            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-zinc-100 text-base">
                        All Customers
                        <span className="text-sm font-normal text-zinc-500 ml-2">
                            ({customers.length} total)
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                        </div>
                    ) : (
                        <div className="rounded-lg border border-zinc-800 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-zinc-800 hover:bg-transparent">
                                        <TableHead className="text-zinc-400 font-medium">
                                            Phone
                                        </TableHead>
                                        <TableHead className="text-zinc-400 font-medium">
                                            Name
                                        </TableHead>
                                        <TableHead className="text-zinc-400 font-medium">
                                            Joined
                                        </TableHead>
                                        <TableHead className="text-zinc-400 font-medium">
                                            Messages
                                        </TableHead>
                                        <TableHead className="text-zinc-400 font-medium">
                                            Last Active
                                        </TableHead>
                                        <TableHead className="text-zinc-400 font-medium">
                                            Action
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.length === 0 ? (
                                        <TableRow className="border-zinc-800">
                                            <TableCell
                                                colSpan={6}
                                                className="text-center py-8 text-zinc-500"
                                            >
                                                No customers found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        customers.map((customer) => (
                                            <TableRow
                                                key={customer.id}
                                                className="border-zinc-800 hover:bg-zinc-800/30 transition-colors"
                                            >
                                                <TableCell className="font-mono text-sm text-zinc-300">
                                                    {customer.phoneNumber}
                                                </TableCell>
                                                <TableCell className="text-sm text-zinc-200">
                                                    {customer.name || "Unknown"}
                                                </TableCell>
                                                <TableCell className="text-sm text-zinc-500">
                                                    {new Date(customer.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <MessageSquare className="h-3 w-3 text-zinc-500" />
                                                        <span className="text-sm text-zinc-400">
                                                            {customer._count.messages}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-zinc-500">
                                                    {customer.conversations[0]
                                                        ? new Date(
                                                            customer.conversations[0].lastMessageAt
                                                        ).toLocaleDateString()
                                                        : "—"}
                                                </TableCell>
                                                <TableCell>
                                                    {customer.conversations[0] && (
                                                        <Link
                                                            href={`/dashboard/conversations/${customer.conversations[0].id}`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                                            >
                                                                View
                                                                <ArrowRight className="h-3 w-3 ml-1" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
