"use client"

import { useEffect, useState, useCallback } from "react"
import ConversationTable from "@/components/dashboard/ConversationTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

export default function ConversationsPage() {
    const [conversations, setConversations] = useState([])
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    })
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)

    const fetchConversations = useCallback(async (page: number, query: string) => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                ...(query && { search: query }),
            })

            const res = await fetch(`/api/dashboard/conversations?${params}`)
            const data = await res.json()
            setConversations(data.conversations || [])
            setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 })
        } catch (error) {
            console.error("Failed to fetch conversations:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchConversations(1, "")
    }, [fetchConversations])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchConversations(1, search)
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
                        All Conversations
                        <span className="text-sm font-normal text-zinc-500 ml-2">
                            ({pagination.total} total)
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
                        </div>
                    ) : (
                        <ConversationTable conversations={conversations} />
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
                            <p className="text-sm text-zinc-500">
                                Page {pagination.page} of {pagination.totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page <= 1}
                                    onClick={() =>
                                        fetchConversations(pagination.page - 1, search)
                                    }
                                    className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() =>
                                        fetchConversations(pagination.page + 1, search)
                                    }
                                    className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
