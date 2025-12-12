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

type Bucket = {
    range: string;   // e.g. "1–5", "6–10"
    users: number;   // count of users in this bucket
    color?: string;
};

type Props = {
    title?: string;
    subtitle?: string;
    data: Bucket[];
    height?: number;
};

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EC4899", "#3B82F6", "#8B5CF6"];

export default function RidesPerUserBarChart({
    title = "Rides per user distribution",
    subtitle = "Shows how many rides each user completes",
    data,
    height = 260,
}: Props) {
    const totalUsers = data.reduce((s, b) => s + b.users, 0);

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
                    <BarChart data={data} barSize={26}>
                        <XAxis
                            dataKey="range"
                            tick={{ fontSize: 12, fill: "#6b7280" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: "#6b7280" }}
                            axisLine={false}
                            tickLine={false}
                            width={35}
                        />
                        <Tooltip
                            formatter={(v: number) => [`${v} users`, "Users"]}
                            contentStyle={{
                                background: "white",
                                borderRadius: "8px",
                                border: "1px solid rgba(0,0,0,0.06)",
                            }}
                        />

                        <Bar dataKey="users" radius={[6, 6, 0, 0]}>
                            {data.map((entry, i) => (
                                <Cell
                                    key={i}
                                    fill={entry.color ?? COLORS[i % COLORS.length]}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Total users analysed: {totalUsers}
            </div>
        </div>
    );
}
