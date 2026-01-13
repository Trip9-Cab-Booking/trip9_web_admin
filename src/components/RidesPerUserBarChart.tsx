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
import { ValueType } from "recharts/types/component/DefaultTooltipContent";

type Bucket = {
    range: string;
    users: number;
    color?: string;
};

type Props = {
    title?: string;
    subtitle?: string;
    data: Bucket[];
    height?: number;
};

const DEFAULT_BUCKETS: Bucket[] = [
    { range: "0-5", users: 0 },
    { range: "6-10", users: 0 },
    { range: "11-20", users: 0 },
    { range: "21+", users: 0 },
];

const COLORS = [
    "#6366F1",
    "#10B981",
    "#F59E0B",
    "#EC4899",
    "#3B82F6",
    "#8B5CF6",
];

export default function RidesPerUserBarChart({
    title = "Rides per user distribution",
    subtitle = "Shows how many rides each user completes",
    data,
    height = 260,
}: Props) {
    const normalizedData: Bucket[] = DEFAULT_BUCKETS.map((bucket) => {
        const apiBucket = data.find((b) => b.range === bucket.range);
        return {
            ...bucket,
            users: apiBucket?.users ?? 0,
        };
    });

    const totalUsers = normalizedData.reduce(
        (sum, b) => sum + b.users,
        0
    );

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                {title}
            </h3>

            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {subtitle}
            </div>

            <div style={{ width: "100%", height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={normalizedData} barSize={26}>
                        <XAxis
                            dataKey="range"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 16, fill: "#6b7280" }}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 16, fill: "#6b7280" }}
                            allowDecimals={false}
                        />

                        <Tooltip
                            formatter={(value: ValueType) => {
                                if (typeof value !== "number") {
                                    return ["0 users", "Users"];
                                }
                                return [`${value} users`, "Users"];
                            }}
                            contentStyle={{
                                background: "white",
                                borderRadius: "8px",
                                border: "1px solid rgba(0,0,0,0.06)",
                                color: "#000000",
                            }}
                        />


                        <Bar
                            dataKey="users"
                            radius={[6, 6, 0, 0]}
                            minPointSize={4}
                        >
                            {normalizedData.map((entry, index) => (
                                <Cell
                                    key={entry.range}
                                    fill={COLORS[index % COLORS.length]}
                                    opacity={entry.users === 0 ? 0.35 : 1}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                Total users analysed: {totalUsers}
            </div>
        </div>
    );
}
