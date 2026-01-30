import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
    title: "trip9 | Dashboard",
    description: "This is trip9 Admin Dashboard",
};

export default function Page() {
    return <DashboardClient />;
}
