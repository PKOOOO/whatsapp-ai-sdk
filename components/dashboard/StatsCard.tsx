import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

interface StatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description?: string
    trend?: string
    variant?: "default" | "success" | "warning" | "danger"
    children?: React.ReactNode
}

const variantStyles = {
    default: {
        icon: "bg-zinc-800/50 text-zinc-400 border-zinc-700/50",
        card: "border-zinc-800",
    },
    success: {
        icon: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        card: "border-emerald-500/20",
    },
    warning: {
        icon: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        card: "border-amber-500/20",
    },
    danger: {
        icon: "bg-red-500/10 text-red-400 border-red-500/20",
        card: "border-red-500/20",
    },
}

export default function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    variant = "default",
    children,
}: StatsCardProps) {
    const styles = variantStyles[variant]

    return (
        <Card className={cn("bg-zinc-900/50 backdrop-blur-sm", styles.card)}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm text-zinc-400">{title}</p>
                        <p className="text-3xl font-bold text-zinc-100">{value}</p>
                        {description && (
                            <p className="text-xs text-zinc-500">{description}</p>
                        )}
                        {trend && (
                            <p className="text-xs text-emerald-400">{trend}</p>
                        )}
                    </div>
                    <div
                        className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg border",
                            styles.icon
                        )}
                    >
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
                {children && <div className="mt-4">{children}</div>}
            </CardContent>
        </Card>
    )
}
