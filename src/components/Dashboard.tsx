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

  const totalRides = mock.ridesPerDay.reduce((s, r) => s + r.rides, 0);
  const avgDistance = 6.2;
  const avgDuration = 18;
  const completionRate = Math.round((mock.funnel.find((s) => s.step === "Completed")?.count || 0) / (mock.funnel[0].count || 1) * 100);

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
              <div className="text-sm text-gray-600">Show plan distribution, popular plans, revenue contribution per plan — use a pie or stacked bar.</div>
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

              <div className="bg-white p-4 rounded-2xl shadow-sm border">
                <h3 className="text-lg font-medium mb-3">Churned users</h3>
                <div className="text-sm text-gray-600">{mock.users.churned} users with no rides in the last X days</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border">
              <h3 className="text-lg font-medium mb-3">Rides per user distribution</h3>
              <div className="text-sm text-gray-600">Histogram or CDF to show heavy users vs casual users (placeholder)</div>
            </div>
          </section>
        )}

        {activeTab === "Revenue & Finance" && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-2 bg-white p-4 rounded-2xl shadow-sm border">
                <h3 className="text-lg font-medium mb-3">Subscription revenue</h3>
                <div className="text-sm text-gray-600">Daily/weekly/monthly revenue chart (time series placeholder)</div>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border">
                <h3 className="text-lg font-medium mb-3">Refunds & penalties</h3>
                <div className="text-sm text-gray-600">Refunds: {mock.revenue.refunds} • Penalties: {mock.revenue.penalties}</div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border">
              <h3 className="text-lg font-medium mb-3">Discounts impact</h3>
              <div className="text-sm text-gray-600">Show discount-driven lift vs baseline revenue (placeholder)</div>
            </div>
          </section>
        )}
      </div>

      {/* <div className="mt-6 text-sm text-gray-500">
        <strong>Notes:</strong> This file is a UI scaffold. I can:
        <ul className="list-disc ml-5 mt-2">
          <li>Wire each card to your APIs and add loading states.</li>
          <li>Add server-side reporting endpoints for heavy queries (aggregation).</li>
          <li>Create reusable chart widgets and export CSV/PNG per report.</li>
        </ul>
      </div> */}
    </div>
  );
}

// "use client"


// import { useAuthGuard } from '@/hooks/useAuthGaurd';
// import { selectCurrentUser } from '@/store/authSlice';
// import React from 'react'
// import { useSelector } from 'react-redux';

// const Dashboard = () => {
//     useAuthGuard();
//     const user = useSelector(selectCurrentUser);
//     // console.log(user);

//   return (
//     <div>
//         <div>ADMIN Dashboard</div>
//     </div>
//   )
// }

// export default Dashboard;