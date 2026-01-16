"use client";

import React from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell,
} from "recharts";

export type PlanSlice = { name: string; value: number; color?: string };

type Props = {
    title?: string;
    subtitle?: string;
    data: PlanSlice[];
    height?: number;        // default 220
    compact?: boolean;
    onBarClick?: (slice: PlanSlice, index: number) => void;
};

const DEFAULT_PALETTE = ["#6366F1", "#10B981", "#F59E0B", "#EC4899", "#7C3AED", "#60A5FA"];

export default function CompactPlanUsageBarChart({
    title = "Subscription Usage",
    subtitle,
    data,
    height = 220,
    compact = false,
    onBarClick,
}: Props) {
    const total = data.reduce((s, d) => s + d.value, 0);

    const chartData = data.map((d, i) => ({
        ...d,
        color: d.color ?? DEFAULT_PALETTE[i % DEFAULT_PALETTE.length],
        percent: total > 0 ? ((d.value / total) * 100).toFixed(1) : 0,
    }));

    return (
        <div
            className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm ${compact ? "w-72" : ""
                }`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
                    {subtitle && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</div>
                    )}
                </div>

                <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{total}</div>
                </div>
            </div>

            <div className="mt-3" style={{ width: "100%", height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" barSize={22}>
                        <XAxis type="number" hide />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={100}
                            tick={{ fontSize: 12, fill: "#6b7280" }}
                        />
                        <Tooltip
                            cursor={{ fill: "rgba(0,0,0,0.04)" }}
                            formatter={(value, _name, props) => {
                                const percent = props?.payload?.percent ?? 0;

                                const safeValue =
                                    typeof value === "number"
                                        ? value
                                        : Number(value) || 0;

                                return [`${safeValue} (${percent}%)`, "Drivers"];
                            }}
                            contentStyle={{
                                background: "white",
                                borderRadius: "8px",
                                border: "1px solid rgba(0,0,0,0.06)",
                            }}
                        />
                        <Bar
                            dataKey="value"
                            radius={[4, 4, 4, 4]}
                            onClick={(bar: any, index: number) =>
                                onBarClick?.(bar.payload as PlanSlice, index)
                            }
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Click a bar to filter drivers by plan.
            </div> */}
        </div>
    );
}
