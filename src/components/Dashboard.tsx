"use client";
import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  CartesianGrid,
} from "recharts";
import CompactPlanUsageRecharts from "./CompactPlanUsageRecharts";
import CompactPlanUsageBarChart from "./CompactPlanUsageRecharts";
import RidesPerUserBarChart from "./RidesPerUserBarChart";
import ChurnedUsersModal from "./ChurnedUsersModal";

type Range = "daily" | "weekly" | "monthly";

type RevenuePoint = {
  label: string;
  revenue: number;
};

const revenueDataMap: Record<"daily" | "weekly" | "monthly", RevenuePoint[]> = {
  daily: [
    { label: "Mon", revenue: 12000 },
    { label: "Tue", revenue: 15000 },
    { label: "Wed", revenue: 9000 },
    { label: "Thu", revenue: 18000 },
    { label: "Fri", revenue: 22000 },
    { label: "Sat", revenue: 17000 },
    { label: "Sun", revenue: 14000 },
  ],
  weekly: [
    { label: "Week 1", revenue: 82000 },
    { label: "Week 2", revenue: 94000 },
    { label: "Week 3", revenue: 88000 },
    { label: "Week 4", revenue: 102000 },
  ],
  monthly: [
    { label: "Jan", revenue: 320000 },
    { label: "Feb", revenue: 280000 },
    { label: "Mar", revenue: 360000 },
    { label: "Apr", revenue: 410000 },
    { label: "May", revenue: 390000 },
    { label: "Jun", revenue: 420000 },
    { label: "Jul", revenue: 480000 },
    { label: "Aug", revenue: 390000 },
    { label: "Sep", revenue: 150000 },
    { label: "Oct", revenue: 220000 },
    { label: "Nov", revenue: 118000 },
    { label: "Dec", revenue: 330000 },
  ],
};


const COLORS = ["#6366F1", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"];

const mock = {
  ridesPerDay: [
    { date: "2025-11-14", rides: 420 },
    { date: "2025-11-15", rides: 510 },
    { date: "2025-11-16", rides: 480 },
    { date: "2025-11-17", rides: 620 },
    { date: "2025-11-18", rides: 710 },
    { date: "2025-11-19", rides: 680 },
    { date: "2025-11-20", rides: 730 },
  ],
  categoryBreakdown: [
    { name: "Cab", value: 4800 },
    { name: "Auto", value: 2200 },
    { name: "Bike", value: 1400 },
  ],
  peakHours: [
    { hour: "06:00", rides: 120 },
    { hour: "07:00", rides: 240 },
    { hour: "08:00", rides: 410 },
    { hour: "09:00", rides: 360 },
    { hour: "17:00", rides: 520 },
    { hour: "18:00", rides: 640 },
    { hour: "19:00", rides: 590 },
  ],
  funnel: [
    { step: "Requests", count: 9800 },
    { step: "Accepted", count: 8600 },
    { step: "Completed", count: 7600 },
    { step: "Cancelled", count: 1200 },
  ],
  drivers: [
    { id: "D-101", name: "Amit", rides: 420, acceptance: 92, cancelRate: 3, onTime: 87, rating: 4.7, onlineHours: 140 },
    { id: "D-102", name: "Priya", rides: 360, acceptance: 88, cancelRate: 2, onTime: 82, rating: 4.6, onlineHours: 120 },
  ],
  users: { new: 1200, returning: 5800, churned: 340 },
  revenue: { subscriptionDaily: 1200, refunds: 150, penalties: 80 },
};

interface KPICardProps {
  label: string;
  value: string | number;
  hint?: string;
}
function KPICard({ label, value, hint }: KPICardProps) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
    </div>
  );
}

interface TabsProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}
function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-2 bg-white p-1 rounded-xl border">
      {tabs.map((t: string) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-3 py-1 rounded-lg text-sm font-medium ${active === t ? "bg-indigo-600 text-white" : "text-gray-600"}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Ride Analytics");
  const [showChurnedModal, setShowChurnedModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<Range>("daily");
  const totalRides = mock.ridesPerDay.reduce((s, r) => s + r.rides, 0);
  const avgDistance = 6.2;
  const avgDuration = 18;
  const completionRate = Math.round((mock.funnel.find((s) => s.step === "Completed")?.count || 0) / (mock.funnel[0].count || 1) * 100);

  const planUsageData = [
    { name: "Daily", value: 42 },
    { name: "Weekly", value: 30 },
    { name: "Monthly", value: 15 },
    { name: "Unlimited", value: 12 },
  ];

  const rideBuckets = [
    { range: "1–5", users: 120 },
    { range: "6–10", users: 75 },
    { range: "11–20", users: 40 },
    { range: "21–30", users: 20 },
    { range: "30+", users: 8 },
  ];

  const revenueData = [
    { name: "Mon", revenue: 12000 },
    { name: "Tue", revenue: 15000 },
    { name: "Wed", revenue: 9000 },
    { name: "Thu", revenue: 18000 },
    { name: "Fri", revenue: 22000 },
    { name: "Sat", revenue: 17000 },
    { name: "Sun", revenue: 14000 },
  ];

  const discountImpactData = [
    { name: "Week 1", baseline: 40000, discounted: 52000 },
    { name: "Week 2", baseline: 45000, discounted: 61000 },
    { name: "Week 3", baseline: 42000, discounted: 58000 },
    { name: "Week 4", baseline: 48000, discounted: 65000 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Admin Analytics</h1>
          <p className="text-sm text-gray-500">Overview and deep-dive reports for rides, drivers, users and revenue.</p>
        </div>

        <Tabs
          tabs={["Ride Analytics", "Driver Performance", "User Behaviour", "Revenue & Finance"]}
          active={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total rides" value={totalRides.toLocaleString()} hint={`Avg/day ${Math.round(totalRides / mock.ridesPerDay.length)}`} />
        <KPICard label="Completion rate" value={`${completionRate}%`} hint={`Requests → Completed`} />
        <KPICard label="Avg distance" value={`${avgDistance} km`} hint="Average ride distance" />
        <KPICard label="Avg duration" value={`${avgDuration} min`} hint="Average ride time" />
      </div>

      <div>
        {activeTab === "Ride Analytics" && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-2 bg-white p-4 rounded-2xl shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">Total rides (time series)</h3>
                  <div className="text-sm text-gray-500">Last 7 days</div>
                </div>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mock.ridesPerDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="rides" stroke={COLORS[0]} strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border">
                <h3 className="text-lg font-medium mb-2">Category breakdown</h3>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={mock.categoryBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                        {mock.categoryBreakdown.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-2 bg-white p-4 rounded-2xl shadow-sm border">
                <h3 className="text-lg font-medium mb-3">Peak hours</h3>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mock.peakHours}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="rides" fill={COLORS[1]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border">
                <h3 className="text-lg font-medium mb-3">Conversion funnel</h3>
                <div className="space-y-2">
                  {mock.funnel.map((f) => (
                    <div key={f.step} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">{f.step}</div>
                        <div className="text-xs text-gray-400">{Math.round((f.count / mock.funnel[0].count) * 100)}% of requests</div>
                      </div>
                      <div className="text-lg font-semibold">{f.count.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border">
              <h3 className="text-lg font-medium mb-3">Cancellation reasons (split)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500">
                      <th className="px-3 py-2">Reason</th>
                      <th className="px-3 py-2">By</th>
                      <th className="px-3 py-2">Count</th>
                      <th className="px-3 py-2">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[{ reason: "Driver no-show", by: "Driver", count: 420 }, { reason: "Rider changed mind", by: "User", count: 320 }, { reason: "System timeout", by: "System", count: 150 }].map((r) => (
                      <tr key={r.reason} className="border-t">
                        <td className="px-3 py-2">{r.reason}</td>
                        <td className="px-3 py-2">{r.by}</td>
                        <td className="px-3 py-2">{r.count.toLocaleString()}</td>
                        <td className="px-3 py-2">{Math.round((r.count / 890) * 100)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {activeTab === "Driver Performance" && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-2 bg-white p-4 rounded-2xl shadow-sm border">
                <h3 className="text-lg font-medium mb-3">Top drivers (by rides)</h3>
                <div className="space-y-3">
                  {mock.drivers.map((d) => (
                    <div key={d.id} className="flex items-center justify-between border rounded-md p-3">
                      <div>
                        <div className="font-medium">{d.name} <span className="text-xs text-gray-400">{d.id}</span></div>
                        <div className="text-xs text-gray-500">Rides: {d.rides} • Rating: {d.rating}</div>
                        <div className="text-xs text-gray-400">Acceptance: {d.acceptance}% • Cancels: {d.cancelRate}%</div>
                      </div>
                      <div className="text-sm">Online hrs: {d.onlineHours}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border">
                <h3 className="text-lg font-medium mb-3">Acceptance / Cancellation</h3>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mock.drivers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="acceptance" name="Acceptance %" />
                      <Bar dataKey="cancelRate" name="Cancel %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border">
              <h3 className="text-lg font-medium mb-3">Subscription plan usage</h3>
              <CompactPlanUsageBarChart
                title="Subscription Plan Usage"
                subtitle="Active drivers by plan"
                data={planUsageData}
              // onBarClick={(slice) => {
              //   console.log("Clicked plan:", slice);
              //   // e.g. setSelectedPlanId(slice.name)
              // }}
              />
            </div>
          </section>
        )}

        {activeTab === "User Behaviour" && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-2 bg-white p-4 rounded-2xl shadow-sm border">
                <h3 className="text-lg font-medium mb-3">New vs Returning</h3>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{ name: "New", value: mock.users.new }, { name: "Returning", value: mock.users.returning }]} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                        <Cell fill={COLORS[0]} />
                        <Cell fill={COLORS[2]} />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      Churned Users
                    </h3>
                    <p className="text-xs text-gray-500">
                      Inactive for last X days
                    </p>
                  </div>

                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-600">
                    High Risk
                  </span>
                </div>

                {/* Metric */}
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-4xl font-bold text-gray-900">
                    {mock.users.churned}
                  </span>
                  <span className="text-sm text-gray-500 mb-1">users</span>
                </div>

                {/* Insight */}
                <p className="text-sm text-gray-600">
                  These users have not completed any rides recently.
                </p>

                {/* Action */}
                {/* <div className="mt-5 pt-4 border-t flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Updated today
                  </span>
                  <button
                    onClick={() => {
                      console.log("Open Churned Users Modal");
                      setShowChurnedModal(true);
                    }}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    View users
                  </button>

                  {showChurnedModal && (
                    <ChurnedUsersModal
                      open={showChurnedModal}
                      onClose={() => setShowChurnedModal(false)}
                    />
                  )}
                </div> */}
              </div>
            </div>

            <RidesPerUserBarChart data={rideBuckets} />
          </section>
        )}

        {activeTab === "Revenue & Finance" && (
          <section className="space-y-6">
            {/* Subscription Revenue */}
            <div className="bg-white rounded-2xl border p-5 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Subscription Revenue
                  </h3>
                  <p className="text-xs text-gray-500">
                    {range === "daily"
                      ? "Daily revenue performance"
                      : range === "weekly"
                        ? "Weekly revenue summary"
                        : "Monthly revenue overview"}
                  </p>
                </div>

                {/* Toggle */}
                <div className="flex gap-1 bg-gray-100 rounded-full p-1">
                  {(["daily", "weekly", "monthly"] as Range[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={`px-3 py-1 text-xs rounded-full transition
                ${range === r
                          ? "bg-white shadow text-gray-900"
                          : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart */}
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueDataMap[range]}
                    barCategoryGap="35%"
                  >
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.04)" }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#2563eb"
                      radius={[6, 6, 0, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Discounts Impact */}
            {/* <div className="bg-white rounded-2xl border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Discounts Impact
                  </h3>
                  <p className="text-xs text-gray-500">
                    Revenue with vs without discounts
                  </p>
                </div>

                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                  Analysis
                </span>
              </div>

              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={discountImpactData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="baseline"
                      name="Without Discount"
                      fill="#9ca3af"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="discounted"
                      name="With Discount"
                      fill="#16a34a"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div> */}
          </section>

        )}
      </div>
    </div >
  );
}

