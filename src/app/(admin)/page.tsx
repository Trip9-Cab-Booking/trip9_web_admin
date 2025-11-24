import Dashboard from "@/components/Dashboard";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title:
    "trip9 | Dashboard",
  description: "This is trip9 Admin Dashboard",
};

export default function Admin() {
  return (
    // <div className="grid grid-cols-12 gap-4 md:gap-6">
    <div>
      <Dashboard />
    </div>
  );
}
