"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import DashboardSidebar from "@/components/dashboard/Sidebar"
import { Menu } from "lucide-react"
import { Toaster } from "@/components/ui/sonner"

const pageTitles: Record<string, string> = {
    "/dashboard": "Overview",
    "/dashboard/conversations": "Conversations",
    "/dashboard/customers": "Customers",
    "/dashboard/analytics": "Analytics",
    "/dashboard/settings": "Settings",
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [sheetOpen, setSheetOpen] = useState(false)
    const [botActive, setBotActive] = useState(true)

    const pageTitle =
        pageTitles[pathname] ||
        (pathname.startsWith("/dashboard/conversations/")
            ? "Conversation"
            : "Dashboard")

    useEffect(() => {
        fetch("/api/dashboard/settings")
            .then((r) => r.json())
            .then((data) => {
                if (data?.isActive !== undefined) {
                    setBotActive(data.isActive)
                }
            })
            .catch(() => { })
    }, [pathname])

    return (
        <div className="flex h-screen bg-zinc-950">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-shrink-0">
                <DashboardSidebar botActive={botActive} />
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col min-w-0">
                {/* Top Bar */}
                <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu */}
                        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                            <SheetTrigger asChild className="md:hidden">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-zinc-400 hover:text-zinc-100"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="p-0 w-64 border-zinc-800 bg-zinc-950"
                            >
                                <DashboardSidebar
                                    botActive={botActive}
                                    onClose={() => setSheetOpen(false)}
                                />
                            </SheetContent>
                        </Sheet>

                        <h1 className="text-lg font-semibold text-zinc-100">
                            {pageTitle}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox: "h-8 w-8",
                                },
                            }}
                        />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
            </div>

            <Toaster richColors position="top-right" />
        </div>
    )
}
