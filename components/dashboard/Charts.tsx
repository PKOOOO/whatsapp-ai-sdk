"use client"

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts"

interface ChartData {
    [key: string]: string | number
}

const COLORS = [
    "#34d399",
    "#60a5fa",
    "#f472b6",
    "#fbbf24",
    "#a78bfa",
    "#fb923c",
]

interface MessagesLineChartProps {
    data: ChartData[]
}

export function MessagesLineChart({ data }: MessagesLineChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    fontSize={12}
                    tickFormatter={(value) => {
                        const d = new Date(value)
                        return `${d.getMonth() + 1}/${d.getDate()}`
                    }}
                />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid #27272a",
                        borderRadius: "8px",
                        color: "#e4e4e7",
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#34d399"
                    strokeWidth={2}
                    dot={{ fill: "#34d399", r: 4 }}
                    activeDot={{ r: 6, fill: "#34d399" }}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}

interface DirectionBarChartProps {
    data: ChartData[]
}

export function DirectionBarChart({ data }: DirectionBarChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid #27272a",
                        borderRadius: "8px",
                        color: "#e4e4e7",
                    }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}

interface TypePieChartProps {
    data: ChartData[]
}

export function TypePieChart({ data }: TypePieChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: "#18181b",
                        border: "1px solid #27272a",
                        borderRadius: "8px",
                        color: "#e4e4e7",
                    }}
                />
                <Legend
                    formatter={(value) => (
                        <span style={{ color: "#a1a1aa" }}>{value}</span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    )
}
