"use client";
import React, { useEffect, useMemo, useState } from "react";
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
import { axiosInstance } from "@/utils/axiosInstance";
import Pagination from "./ui/pagination";


type Range = "daily" | "weekly" | "monthly";

type RevenuePoint = {
  label: string;
  revenue: number;
};

type DashboardStats = {
  totalRides: number;
  avgPerDay: number;
  completionRate: string;
  avgDistance: string;
  avgDuration: string;
};

type RideTimeSeries = {
  date: string;
  rides: number;
};

type CategoryBreakdown = {
  name: string;
  value: number;
};

type PeakHour = {
  hour: string;
  rides: number;
};

type FunnelStep = {
  step: string;
  count: number;
  percentage: number;
};

type CancellationReason = {
  reason: string;
  cancelledBy: "user" | "driver" | "system";
  count: number;
  share: number;
};

type Driver = {
  driverId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  totalRequests: number;
  rating: number;
  acceptancePercentage: number;
  cancellationPercentage: number;
  onlineHours: string;
};

type PaginationInfo = {
  currentPage: number;
  totalPages: number;
};

type RideBucket = {
  range: string;
  users: number;
};

type PieItem = {
  name: string;
  value: number;
  renderValue: number;
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
const ZERO_COLOR = "#E5E7EB";

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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [rideSeries, setRideSeries] = useState<RideTimeSeries[]>([]);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<CategoryBreakdown[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
  const [peakLoading, setPeakLoading] = useState(true);
  const [funnelData, setFunnelData] = useState<FunnelStep[]>([]);
  const [funnelLoading, setFunnelLoading] = useState(true);
  const [cancellations, setCancellations] = useState<CancellationReason[]>([]);
  const [cancelLoading, setCancelLoading] = useState(true);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1
  });
  const [driversLoading, setDriversLoading] = useState(true);
  const [rideBuckets, setRideBuckets] = useState<RideBucket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showChurnedModal, setShowChurnedModal] = useState(false);
  const [churnedUsers, setChurnedUsers] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<PieItem[]>([]);
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

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await axiosInstance.get("/api/admin/dashboard/view");
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (activeTab !== "Ride Analytics") return;

    const fetchRideTimeSeries = async () => {
      try {
        const res = await axiosInstance.get(
          "/api/admin/dashboard/ride-time-series",
          {
            params: { type: "daily" }
          }
        );

        if (res.data?.success) {
          setRideSeries(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch ride time series", error);
      } finally {
        setSeriesLoading(false);
      }
    };

    fetchRideTimeSeries();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "Ride Analytics") return;

    const fetchCategoryBreakdown = async () => {
      try {
        const res = await axiosInstance.get(
          "/api/admin/dashboard/category-breakdown"
        );

        if (res.data?.success) {
          const normalized = res.data.data.map(
            (item: { vehicleType: string; rides: number }) => ({
              name: item.vehicleType.toUpperCase(),
              value: item.rides
            })
          );

          setCategoryData(normalized);
        }
      } catch (error) {
        console.error("Failed to fetch category breakdown", error);
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategoryBreakdown();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "Ride Analytics") return;

    const fetchPeakHours = async () => {
      try {
        const res = await axiosInstance.get(
          "/api/admin/dashboard/peak-hours",
          {
            params: { status: "cancelled" }
          }
        );

        if (res.data?.success) {
          setPeakHours(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch peak hours", error);
      } finally {
        setPeakLoading(false);
      }
    };

    fetchPeakHours();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "Ride Analytics") return;

    const fetchConversionFunnel = async () => {
      try {
        const res = await axiosInstance.get(
          "/api/admin/dashboard/conversion-funnel",
          {
            params: { status: "completed" }
          }
        );

        if (res.data?.success) {
          const d = res.data.data;

          const normalized: FunnelStep[] = [
            { step: "Requests", count: d.requests.count, percentage: d.requests.percentage },
            { step: "Accepted", count: d.accepted.count, percentage: d.accepted.percentage },
            { step: "Completed", count: d.completed.count, percentage: d.completed.percentage },
            { step: "Cancelled", count: d.cancelled.count, percentage: d.cancelled.percentage }
          ];

          setFunnelData(normalized);
        }
      } catch (error) {
        console.error("Failed to fetch conversion funnel", error);
      } finally {
        setFunnelLoading(false);
      }
    };

    fetchConversionFunnel();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "Ride Analytics") return;

    const fetchCancellations = async () => {
      try {
        const res = await axiosInstance.get(
          "/api/admin/dashboard/cancellation"
        );

        if (res.data?.success) {
          setCancellations(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch cancellation reasons", error);
      } finally {
        setCancelLoading(false);
      }
    };

    fetchCancellations();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "Driver Performance") return;
    const fetchTopDrivers = async () => {
      setDriversLoading(true);
      try {
        const res = await axiosInstance.get(
          "/api/admin/dashboard/TopDriverList",
          {
            params: {
              limit: 2,
              page: currentPage
            }
          }
        );

        if (res.data?.success) {
          setDrivers(res.data.data.drivers);

          const { totalDrivers } = res.data.data.pagination;
          setTotalPages(Math.ceil(totalDrivers / 2));
        }
      } catch (error) {
        console.error("Failed to fetch top drivers", error);
      } finally {
        setDriversLoading(false);
      }
    };

    fetchTopDrivers();
  }, [activeTab, currentPage]);

  useEffect(() => {
    const fetchRideDistribution = async () => {
      try {
        setLoading(true);

        const response = await axiosInstance.get(
          "/api/admin/dashboard/user-ride-distribution"
        );

        setRideBuckets(response.data.data.buckets);
      } catch (err) {
        console.error("Failed to fetch user ride distribution", err);
        setError("Unable to load ride distribution data");
      } finally {
        setLoading(false);
      }
    };

    fetchRideDistribution();
  }, []);

  useEffect(() => {
    const fetchNonRiders = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get(
          "/api/admin/dashboard/user-NonRiders"
        );

        setChurnedUsers(res.data.data.noCompletedRideUsers ?? 0);
      } catch (err) {
        console.error("Failed to fetch churned users", err);
        setError("Failed to fetch churned users");
      } finally {
        setLoading(false);
      }
    };

    fetchNonRiders();
  }, []);

  useEffect(() => {
    const fetchNewVsReturning = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get(
          "/api/admin/dashboard/user-new-vs-returning"
        );

        const {
          newUsers,
          returningUsers,
        } = res.data.data;

        const rawData = [
          { name: "New", value: newUsers },
          { name: "Returning", value: returningUsers },
        ];
        const isAllZero = rawData.every((d) => d.value === 0);

        const chartData: PieItem[] = rawData.map((item) => ({
          ...item,
          renderValue: isAllZero ? 1 : item.value,
        }));

        setData(chartData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch new vs returning users", err);
        setError("Failed to load user distribution");
      } finally {
        setLoading(false);
      }
    };

    fetchNewVsReturning();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-2xl text-sm text-gray-500">
        Loading ride distribution…
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-2xl text-sm text-red-500">
        {error}
      </div>
    );
  }

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

      {loading ? (
        <div className="text-sm text-gray-500">Loading dashboard stats…</div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            label="Total rides"
            value={stats.totalRides.toLocaleString()}
            hint={`Avg/day ${stats.avgPerDay}`}
          />

          <KPICard
            label="Completion rate"
            value={stats.completionRate}
            hint="Requests → Completed"
          />

          <KPICard
            label="Avg distance"
            value={stats.avgDistance}
            hint="Average ride distance"
          />

          <KPICard
            label="Avg duration"
            value={stats.avgDuration}
            hint="Average ride time"
          />
        </div>
      ) : null}


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
                  {seriesLoading ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400">
                      Loading ride analytics…
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={rideSeries}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="rides"
                          stroke={COLORS[0]}
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border">
                <h3 className="text-lg font-medium mb-2">Category breakdown</h3>
                <div style={{ height: 260 }}>
                  {categoryLoading ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400">
                      Loading category data…
                    </div>
                  ) : categoryData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400">
                      No category data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                        >
                          {categoryData.map((_, idx) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-2 bg-white p-4 rounded-2xl shadow-sm border">
                <h3 className="text-lg font-medium mb-3">Peak hours</h3>
                <div style={{ height: 220 }}>
                  {peakLoading ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400">
                      Loading peak hours…
                    </div>
                  ) : peakHours.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400">
                      No peak hour data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={peakHours}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="rides" fill={COLORS[1]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border">
                <h3 className="text-lg font-medium mb-3">Conversion funnel</h3>
                {funnelLoading ? (
                  <div className="text-sm text-gray-400">Loading funnel data…</div>
                ) : funnelData.length === 0 ? (
                  <div className="text-sm text-gray-400">No funnel data available</div>
                ) : (
                  <div className="space-y-2">
                    {funnelData.map((f) => (
                      <div key={f.step} className="flex items-center justify-between">
                        <div>
                          <div className="text-sm">{f.step}</div>
                          <div className="text-xs text-gray-400">
                            {f.percentage}% of requests
                          </div>
                        </div>
                        <div className="text-lg font-semibold">
                          {f.count.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    {cancelLoading ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-400">
                          Loading cancellation data…
                        </td>
                      </tr>
                    ) : cancellations.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-400">
                          No cancellation data available
                        </td>
                      </tr>
                    ) : (
                      cancellations.map((r, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-2">{r.reason}</td>
                          <td className="px-3 py-2 capitalize">{r.cancelledBy}</td>
                          <td className="px-3 py-2">{r.count.toLocaleString()}</td>
                          <td className="px-3 py-2">{r.share}%</td>
                        </tr>
                      ))
                    )}
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

                {driversLoading ? (
                  <div className="text-sm text-gray-400">Loading drivers…</div>
                ) : drivers.length === 0 ? (
                  <div className="text-sm text-gray-400">No drivers found</div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {drivers.map((d) => {
                        const name =
                          d.firstName || d.lastName
                            ? `${d.firstName ?? ""} ${d.lastName ?? ""}`.trim()
                            : d.phone ?? "Unknown driver";

                        return (
                          <div
                            key={d.driverId}
                            className="flex items-center justify-between border rounded-md p-3"
                          >
                            <div>
                              <div className="font-medium">
                                {name}
                                <span className="ml-2 text-xs text-gray-400">
                                  {d.driverId.slice(-6)}
                                </span>
                              </div>

                              <div className="text-xs text-gray-500">
                                Rides: {d.totalRequests} • Rating: {d.rating}
                              </div>

                              <div className="text-xs text-gray-400">
                                Acceptance: {d.acceptancePercentage}% • Cancels:{" "}
                                {d.cancellationPercentage}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => {
                          console.log("PAGE CLICKED:", page);
                          setCurrentPage(page);
                        }}
                        compact
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border">
                <h3 className="text-lg font-medium mb-3">Acceptance / Cancellation</h3>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={drivers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="driverId"
                        tickFormatter={(id) => id.slice(-4)}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="acceptancePercentage"
                        name="Acceptance %"
                        fill={COLORS[2]}
                      />
                      <Bar
                        dataKey="cancellationPercentage"
                        name="Cancel %"
                        fill={COLORS[3]}
                      />
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
                <h3 className="text-lg font-medium mb-3">
                  New vs Returning
                </h3>

                {loading ? (
                  <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">
                    Loading chart…
                  </div>
                ) : error ? (
                  <div className="h-[260px] flex items-center justify-center text-sm text-red-500">
                    {error}
                  </div>
                ) : (
                  <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data}
                          dataKey="renderValue"
                          nameKey="name"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          minAngle={2}
                        >
                          {data.map((_, index) => (
                            <Cell
                              key={index}
                              fill={
                                data[index].value === 0
                                  ? ZERO_COLOR
                                  : COLORS[index]
                              }
                              opacity={data[index].value === 0 ? 0.6 : 1}
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          formatter={(_, __, props) => [
                            `${props.payload.value} users`,
                            props.payload.name,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      Churned Users
                    </h3>
                  </div>

                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-600">
                    High Risk
                  </span>
                </div>

                {/* Metric */}
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-4xl font-bold text-gray-900">
                    {loading ? "—" : error ? "0" : churnedUsers}
                  </span>
                  <span className="text-sm text-gray-500 mb-1">users</span>
                </div>

                {/* Insight */}
                <p className="text-sm text-gray-600">
                  These users have not completed any rides.
                </p>
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

