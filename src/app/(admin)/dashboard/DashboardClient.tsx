"use client";

import Dashboard from "@/components/Dashboard";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function DashboardClient() {
    useRequireAuth();

    return <Dashboard />;
}