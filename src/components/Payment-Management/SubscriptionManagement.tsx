"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plan as TPlan, Driver as TDriver, Payment as TPayment, formatCurrency, todayISO } from "../../types/types";
import PlanCard from "../ui/plancard/PlanCard";
import Modal from "../ui/modal/Modal";
// import PlanForm from "../ui/planForm/PlanForm";
import PaymentsView from "../ui/payment-view/PaymentsView";
import { axiosInstance } from "@/utils/axiosInstance";
import CustomSnackbar from "../CustomSnackbar";
import PlanFormModal, { PlanPayload } from "../ui/planForm/PlanForm";
import Pagination from "../ui/pagination";
import DeleteConfirmModal from "../DeleteConfirmModal";


const mockDrivers: TDriver[] = [
  { id: "d1", name: "Arun Sharma", phone: "+91 98765 43210", email: "arun@example.com", planId: "p2", subscriptionStart: "2025-10-01T00:00:00.000Z", subscriptionEnd: "2025-11-01T00:00:00.000Z" },
  { id: "d2", name: "Sana Roy", phone: "+91 91234 56789", email: "sana@example.com", planId: "p1", subscriptionStart: "2025-09-10T00:00:00.000Z", subscriptionEnd: "2025-10-10T00:00:00.000Z" },
  { id: "d3", name: "Vikram Patel", phone: "+91 99887 66554", email: "vikram@example.com", planId: null },
  { id: "d4", name: "Ria Sen", phone: "+91 90000 11111", email: "ria@example.com", planId: "p2", subscriptionStart: "2025-11-01T00:00:00.000Z", subscriptionEnd: "2025-12-01T00:00:00.000Z" },
];

const mockPayments: TPayment[] = [
  { id: "pay1", driverId: "d1", amount: 499, date: "2025-10-01T09:00:00.000Z", planId: "p2" },
  { id: "pay2", driverId: "d2", amount: 199, date: "2025-09-10T10:30:00.000Z", planId: "p1" },
  { id: "pay3", driverId: "d4", amount: 499, date: "2025-11-01T12:00:00.000Z", planId: "p2" },
];

type VehicleType = "car_economy" | "car_premium" | "bike" | "auto";

type DriversPage = {
  drivers: TDriver[];
  page: number;
  totalPages: number;
  loading: boolean;
  error?: string | null;
};


export default function SubscriptionManagement() {
  const [plans, setPlans] = useState<TPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansTotalCount, setPlansTotalCount] = useState<number | null>(null);
  const [noPlansMessage, setNoPlansMessage] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<TDriver[]>([]);
  const [payments, setPayments] = useState<TPayment[]>(mockPayments);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TPlan | null>(null);
  const [showPaymentsModalForDriver, setShowPaymentsModalForDriver] = useState<string | null>(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const totalPlanPages = Math.max(1, Math.ceil(plans.length / pageSize));
  const pagedPlans = useMemo(() => plans.slice((page - 1) * pageSize, page * pageSize), [plans, page]);
  const [subscriptionStats, setSubscriptionStats] = useState({
    activeSubscriptionCount: 0,
    totalRevenue: 0,
    subscriptionPlanCount: 0,
    unassignedDrivers: [],
    unassignedDriversCount: 0,
  });

  const [remoteDriversByPlan, setRemoteDriversByPlan] = useState<Record<string, DriversPage>>({});
  const DEFAULT_PAGE_SIZE = 10;


  // snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info">("info");

  // view/edit flag
  const [isViewMode, setIsViewMode] = useState<boolean>(false);

  // Delete Modal states
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);


  const totalPages = Math.max(
    1,
    Math.ceil((plansTotalCount ?? plans.length) / pageSize)
  );

  function openSnackbar(message: string, severity: "success" | "error" | "info" = "info") {
    setSnackbarMsg(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }

  function closeSnackbar() {
    setSnackbarOpen(false);
  }

  const activeSubscriptions = useMemo(() => {
    const now = new Date();
    return drivers.filter((d) => d.subscriptionStart && d.subscriptionEnd && new Date(d.subscriptionEnd) > now).length;
  }, [drivers]);

  const revenue = useMemo(() => payments.reduce((s, p) => s + p.amount, 0), [payments]);

  const driversByPlan = useMemo(() => {
    const map: Record<string, TDriver[]> = {};
    plans.forEach((p) => (map[p.id] = []));
    map["unassigned"] = [];
    drivers.forEach((raw) => {
      const d = {
        ...raw,
        id: raw.driverId ?? raw._id ?? raw.id,
        planId: raw.planId ?? raw.subscriptionPlanId ?? null,
        name: raw.name ?? raw.driverName ?? "",
        email: raw.email ?? "",
        phone: raw.phone ?? raw.mobile ?? "",
      };

      if (d.planId && map[d.planId]) map[d.planId].push(d);
      else map["unassigned"].push(d);
    });


    return map;
  }, [drivers, plans]);


  function mapVehicleType(vt: VehicleType) {
    if (vt === "bike") return { vehicleType: "bike", category: null };
    if (vt === "auto") return { vehicleType: "auto", category: null };
    if (vt === "car_economy") return { vehicleType: "car", category: "economy" };
    if (vt === "car_premium") return { vehicleType: "car", category: "premium" };
    return { vehicleType: "unknown", category: null };
  }

  function handleOpenCreatePlan() {
    setEditingPlan(null);
    setIsViewMode(false);
    setShowPlanModal(true);
  }

  function handleEditPlan(plan: TPlan) {
    setEditingPlan(plan);
    setShowPlanModal(true);
  }

  function handleViewPlan(plan: TPlan) {
    setEditingPlan(plan);
    setIsViewMode(true);
    setShowPlanModal(true);
  }

  function openPaymentHistory(driverId: string) {
    setShowPaymentsModalForDriver(driverId);
  }

  function addPayment(payload: { driverId: string; amount: number; planId?: string | null }) {
    const newPayment: TPayment = { id: `pay_${Math.random().toString(36).slice(2, 9)}`, driverId: payload.driverId, amount: payload.amount, planId: payload.planId ?? null, date: todayISO() };
    setPayments((p) => [newPayment, ...p]);

    if (payload.planId) {
      const start = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + 1);
      setDrivers((d) => d.map((dr) => (dr.id === payload.driverId ? { ...dr, planId: payload.planId, subscriptionStart: start.toISOString(), subscriptionEnd: end.toISOString() } : dr)));
    }
  }

  function mapPlanToFormInitial(plan?: TPlan | null): Partial<PlanPayload> | null {
    if (!plan) return null;
    let vehicleType: PlanPayload["vehicleType"] | undefined;
    let category: PlanPayload["category"] | undefined;

    if (plan.vehicleTypes?.some((v) => v.startsWith("car"))) {
      vehicleType = "car";
      category = plan.vehicleTypes!.some((v) => v.includes("economy")) ? "economy" : "premium";
    } else if (plan.vehicleTypes?.includes("auto")) {
      vehicleType = "auto";
    } else if (plan.vehicleTypes?.includes("bike")) {
      vehicleType = "bike";
    }

    const firstKey = plan.vehicleTypes?.[0];
    let days: number | undefined;
    if (firstKey && plan.vehiclePricing && (plan.vehiclePricing as any)[firstKey]?.durationDays) {
      days = (plan.vehiclePricing as any)[firstKey].durationDays;
    } else if (typeof plan.durationMonths === "number") {
      days = plan.durationMonths * 30;
    }

    return {
      planName: plan.name,
      description: plan.description ?? "",
      subscriptionType: (plan.subscriptionType ?? "daily") as any,
      isUnlimited: (plan.subscriptionType ?? "").toString() === "unlimited",
      days,
      price: plan.pricePerMonth ?? 0,
      vehicleType,
      category,
      rideLimit: plan.rideLimit,
    };
  }

  function mapApiSubToPlan(s: any): TPlan {
    const vehicleTypes: string[] = [];
    if (s.vehicleType) {
      if (s.vehicleType === "car") {
        const cat = s.category ?? (s.vehicleCategory ?? "");
        vehicleTypes.push(cat ? `car_${cat}` : "car_economy");
      } else {
        vehicleTypes.push(s.vehicleType);
      }
    } else if (s.isUnlimited) {
      vehicleTypes.push("bike", "auto", "car_economy", "car_premium");
    }

    const vp: Record<string, any> = {};

    // Preserve raw days from API (important)
    const days: number | undefined = typeof s.days === "number" ? s.days : undefined;

    // compute durationMonths only as a helpful derived value (not used for days-first display)
    const durationMonths: number | null = typeof days === "number" ? days / 30 : (typeof s.durationMonths === "number" ? s.durationMonths : null);

    return {
      id: s.subscriptionId ?? s._id,
      name: s.planName ?? s.plan_name ?? "Untitled plan",
      description: s.description ?? null,
      pricePerMonth: typeof s.price === "number" ? s.price : (s.price ?? null),
      durationMonths,
      days,                     // ← keep API days intact
      subscriptionType: s.subscriptionType as any,
      isActive: typeof s.active === "boolean" ? s.active : Boolean(s.isUnlimited),
      vehicleTypes,
      vehiclePricing: vp,
      rideLimit: typeof s.rideLimit === "number" ? s.rideLimit : (s.rideLimit ?? null),
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    } as unknown as TPlan;
  }

  const fetchPlans = async () => {
    let cancelled = false;
    setPlansLoading(true);
    setNoPlansMessage(null);

    try {
      const res = await axiosInstance.get("/api/subscription/subscription-plan/fetch-all", {
        params: { page, limit: pageSize },
      });

      const api = res?.data;

      if (api && api.success === false) {
        if (!cancelled) {
          setPlans([]);
          setPlansTotalCount(0);
          setNoPlansMessage(api.message ?? "No subscriptions available");
        }
        return;
      }

      const subs = res?.data?.data?.subscriptions ?? [];
      const pagination = res?.data?.data?.pagination;

      const mapped = subs.map(mapApiSubToPlan);

      if (!cancelled) {
        setPlans(mapped);
        setPlansTotalCount(pagination?.totalCount ?? mapped.length);
      }
    } catch (err: any) {
      const resp = err?.response;
      if (resp?.status === 404 && resp?.data?.message) {
        setPlans([]);
        setPlansTotalCount(0);
        setNoPlansMessage(resp.data.message);
      } else {
        console.error("Failed to fetch plans:", err);
        openSnackbar?.("Failed to load plans", "error");
      }
    } finally {
      if (!cancelled) setPlansLoading(false);
    }
  };
  useEffect(() => {
    fetchPlans();
  }, [page, pageSize]);

  async function fetchSubscriptionStats() {
    try {
      const res = await axiosInstance.get("/api/subscription/allSubscriptionpayments");
      const data = res?.data?.data;
      setSubscriptionStats({
        activeSubscriptionCount: data?.activeSubscriptionCount ?? 0,
        totalRevenue: data?.totalRevenue ?? 0,
        subscriptionPlanCount: data?.subscriptionPlanCount ?? 0,
        unassignedDriversCount: data?.unassignedDrivers?.count ?? 0,
        unassignedDrivers: data?.unassignedDrivers?.data ?? [],
      });

      setDrivers((prev) => {
        const incoming = data?.unassignedDrivers?.data ?? [];

        const normalized: TDriver[] = incoming.map((raw: any) => ({
          id: raw.driverId ?? raw._id ?? raw.id ?? `drv_${Math.random().toString(36).slice(2, 8)}`,
          _id: raw._id,
          driverId: raw.driverId,
          planId: raw.planId ?? raw.subscriptionPlanId ?? raw.planId ?? null,
          name: raw.name ?? raw.driverName ?? "",    // keep empty if not provided
          email: raw.email ?? "",
          phone: raw.phone ?? raw.mobile ?? "",
          paymentHistory: raw.paymentHistory ?? raw.payments ?? [],
          ...raw,
        }));
        const byId = new Map(prev.map((d) => [d.id, d]));
        normalized.forEach((d) => byId.set(d.id, d));
        return Array.from(byId.values());
      });

    } catch (err) {
      console.error("Failed to fetch subscription stats:", err);
      openSnackbar?.("Failed to load subscription statistics", "error");
    }
  }

  useEffect(() => {
    fetchSubscriptionStats();
  }, []);

  async function handleSavePlanFromForm(payload: PlanPayload) {
    setIsSavingPlan(true);
    const stripUndefined = <T extends Record<string, any>>(obj: T): Partial<T> => {
      const out: Partial<T> = {};
      Object.keys(obj).forEach((k) => {
        const v = (obj as any)[k];
        if (v !== undefined) out[k as keyof T] = v;
      });
      return out;
    };

    const makeApiPayload = (p: PlanPayload) => {
      if (p.isUnlimited) {
        return stripUndefined({
          description: p.description ?? "",
          planName: p.planName,
          subscriptionType: p.subscriptionType,
          isUnlimited: true,
          days: p.days ?? null,
          price: p.price,
          rideLimit: p.rideLimit ?? undefined,
        });
      }

      const vehicleTypeApi = p.vehicleType === "car" ? "car" : p.vehicleType;
      return stripUndefined({
        description: p.description ?? "",
        planName: p.planName,
        subscriptionType: p.subscriptionType,
        isUnlimited: false,
        days: p.days ?? null,
        price: p.price,
        vehicleType: vehicleTypeApi,
        category: p.vehicleType === "car" ? p.category : undefined,
        rideLimit: p.rideLimit ?? undefined,
      });
    };

    const makeUpdatePayload = (p: PlanPayload, original: TPlan) => {
      const base = {
        planName: p.planName,
        description: p.description ?? "",
        days: p.days ?? null,
        price: p.price,
        rideLimit: p.rideLimit ?? undefined,
      } as Record<string, any>;

      // If the original plan was unlimited, keep explicit isUnlimited true
      // if (original.isUnlimited) {
      //   base.isUnlimited = true;
      // }

      return stripUndefined(base);
    };

    try {
      let apiBody: Record<string, any>;

      if (editingPlan) {
        // UPDATE payload
        apiBody = makeUpdatePayload(payload, editingPlan);
      } else {
        // CREATE: payload
        apiBody = makeApiPayload(payload);
      }

      if (editingPlan) {
        // UPDATE
        const planId = editingPlan.id;
        const url = `/api/subscription/subscription-plan/update/${planId}`;

        const res = await axiosInstance.put(url, apiBody);
        const serverPlan = res?.data?.data ?? res?.data ?? null;
        const source = {
          ...(editingPlan || {}),
          ...(apiBody || {}),
          ...(serverPlan || {}),
        };
        const updatedPlan: TPlan = {
          ...editingPlan,
          id: planId,
          name: (source.planName ?? source.name ?? editingPlan.name) as string,
          description: source.description ?? editingPlan.description ?? null,
          pricePerMonth:
            typeof source.price === "number"
              ? source.price
              : typeof source.pricePerMonth === "number"
                ? source.pricePerMonth
                : editingPlan.pricePerMonth,
          days: typeof source.days === "number" ? source.days : editingPlan.days,
          rideLimit: typeof source.rideLimit === "number" ? source.rideLimit : editingPlan.rideLimit,
          subscriptionType: source.subscriptionType ?? editingPlan.subscriptionType,
          isActive: typeof source.active === "boolean" ? source.active : editingPlan.isActive,
          vehicleTypes: editingPlan.vehicleTypes,
          vehiclePricing: editingPlan.vehiclePricing,
        } as unknown as TPlan;

        setPlans((prev) => prev.map((p) => (p.id === planId ? updatedPlan : p)));

        openSnackbar("Plan updated", "success");
        setEditingPlan(null);
        setShowPlanModal(false);
        return;
      }

      // CREATE branch
      const createUrl = "/api/subscription/subscription-plan/create";
      const createRes = await axiosInstance.post(createUrl, apiBody);
      const created = createRes?.data?.data ?? createRes?.data ?? null;

      const createdPlan: TPlan = {
        id: created?.subscriptionId ?? created?._id ?? created?.id ?? `p_${Math.random().toString(36).slice(2, 8)}`,
        name: created?.planName ?? created?.name ?? payload.planName,
        description: created?.description ?? payload.description ?? null,
        pricePerMonth: typeof created?.price === "number" ? created.price : payload.price,
        days: typeof created?.days === "number" ? created.days : payload.days ?? undefined,
        subscriptionType: created?.subscriptionType ?? payload.subscriptionType,
        isActive: typeof created?.active === "boolean" ? created.active : true,
        vehicleTypes: [],
        vehiclePricing: {},
        rideLimit: created?.rideLimit ?? payload.rideLimit ?? null,
        createdAt: created?.createdAt,
        updatedAt: created?.updatedAt,
      } as unknown as TPlan;

      setPlans((prev) => [createdPlan, ...prev]);
      openSnackbar("Plan created", "success");
      setShowPlanModal(false);
      await fetchPlans();
    } catch (err: any) {
      console.error("Save plan failed", err);
      openSnackbar(err?.response?.data?.message ?? err?.message ?? "Failed to save plan", "error");
    } finally {
      setIsSavingPlan(false);
    }
  }

  function openDeleteModal(id: string) {
    setSelectedPlanId(id);
    setDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!selectedPlanId) return;

    setDeleteLoading(true);
    try {
      const url = `/api/subscription/subscription-plan/delete/${selectedPlanId}`;

      await axiosInstance.delete(url);
      setPlans((prev) => prev.filter((p) => p.id !== selectedPlanId));
      setDrivers((prev) =>
        prev.map((d) => (d.planId === selectedPlanId ? { ...d, planId: null } : d))
      );

      setDeleteOpen(false);
      setSelectedPlanId(null);
    } catch (err: any) {
      console.error("Failed to delete plan", err);
      const message =
        err?.response?.data?.message ?? "Failed to delete plan. Please try again.";
      alert(message);
    } finally {
      setDeleteLoading(false);
    }
  }

  function normalizeSubscriptionToDriver(s: any, planId: string): TDriver {
    const drv = s?.driver ?? s;
    const driverId = drv?.driverId ?? drv?._id ?? drv?.id ?? null;
    const first = drv?.firstName ?? drv?.first_name ?? "";
    const last = drv?.lastName ?? drv?.last_name ?? "";

    const fullName =
      [first, last].filter(Boolean).join(" ").trim() ||
      drv?.name ||
      drv?.driverName ||
      "Unknown Driver";

    return {
      id: driverId ?? `drv_${Math.random().toString(36).slice(2, 8)}`,
      _id: drv?._id ?? null,
      driverId: driverId,
      name: fullName,
      email: drv?.email ?? "",
      phone: drv?.phone ?? drv?.mobile ?? "",
      planId: planId ?? (s?.planId ?? s?.subscriptionPlanId ?? null),
      subscriptionId: s?.subscriptionId ?? null,
      active: Boolean(s?.active ?? false),
      expiresAt: s?.expiresAt ?? null,
      raw: s,
    } as TDriver;
  }


  async function fetchDriversForSubscription(
    subscriptionType: string,
    planId: string,
    page = 1,
    limit = DEFAULT_PAGE_SIZE
  ) {
    setRemoteDriversByPlan((prev) => ({
      ...prev,
      [planId]: {
        ...(prev[planId] ?? { drivers: [], page: 1, totalPages: 1, loading: false, error: null }),
        loading: true,
        error: null,
      },
    }));

    try {
      const res = await axiosInstance.get("/api/subscription/AllDriversBySubscription", {
        params: { page, limit, subscriptionType },
      });

      const payload = res?.data?.data ?? res?.data ?? res ?? {};
      // prefer subscriptions, otherwise fallback to drivers/items
      const subsArray = payload.subscriptions ?? payload.drivers ?? payload.items ?? [];

      // normalize each subscription -> TDriver
      const drivers: TDriver[] = (subsArray || []).map((s: any) => normalizeSubscriptionToDriver(s, planId));

      // derive pagination from common shapes
      const pagination = payload.pagination ?? payload.meta ?? {};
      const total = pagination?.total ?? (drivers.length || 0);
      const pageFromResponse = pagination?.page ?? page;
      const totalPages = Math.max(1, Math.ceil(total / (limit || DEFAULT_PAGE_SIZE)));

      setRemoteDriversByPlan((prev) => ({
        ...prev,
        [planId]: { drivers, page: pageFromResponse, totalPages, loading: false, error: null },
      }));
    } catch (err: any) {
      console.error("Failed to fetch drivers for subscription:", err);
      const message = err?.response?.data?.message ?? "Failed to load drivers";
      setRemoteDriversByPlan((prev) => ({
        ...prev,
        [planId]: { ...(prev[planId] ?? { drivers: [], page: 1, totalPages: 1 }), loading: false, error: message },
      }));
      openSnackbar(message, "error");
    }
  }


  function toggleShowPlan(plan: TPlan) {
    // toggle same id -> hide
    if (selectedPlanId === plan.id) {
      setSelectedPlanId(null);
      return;
    }

    setSelectedPlanId(plan.id);

    // If we already have cached drivers for this plan, don't re-fetch.
    const existing = remoteDriversByPlan[plan.id];
    if (existing && existing.drivers && existing.drivers.length > 0) return;

    // Fetch first page
    fetchDriversForSubscription(String(plan.subscriptionType ?? ""), plan.id, 1, DEFAULT_PAGE_SIZE);
  }

  function changePlanDriversPage(planId: string, newPage: number) {
    const pageSize = DEFAULT_PAGE_SIZE;
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    fetchDriversForSubscription(String(plan.subscriptionType ?? ""), planId, newPage, pageSize);
  }



  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Subscription Payment Management</h2>
        <div className="flex gap-3">
          <button onClick={handleOpenCreatePlan} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
            Create Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Active subscriptions</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {subscriptionStats.activeSubscriptionCount}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Revenue from subscriptions</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(subscriptionStats.totalRevenue)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total plans</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {subscriptionStats.subscriptionPlanCount}
          </div>
        </div>
      </div>


      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Plans</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {plans.length > 0 ? plans.length : 0} of {plansTotalCount ?? plans.length}
            </div>
          </div>

          {plansLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {plans.length === 0 ? (
                <div className="border rounded-md p-6 bg-white dark:bg-gray-800 text-center">
                  <div className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No subscription plans</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {noPlansMessage ?? "No plans found. Create a new plan to get started."}
                  </div>

                  <div className="flex justify-center gap-3">
                    <button
                      onClick={handleOpenCreatePlan}
                      className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Create plan
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {plans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      onEdit={(p) => handleEditPlan(p)}
                      onDelete={(id) => openDeleteModal(id)}
                      onView={handleViewPlan}
                      onViewDrivers={() => toggleShowPlan(plan)}
                    // onViewDrivers={(id: string) => setSelectedPlanId(id)}
                    />
                  ))}

                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(p) => {
                      setPage(p);
                      setSelectedPlanId(null);      // close open plan when plans page changes
                      setRemoteDriversByPlan({});   // optional: clear cached remote driver pages
                    }}
                    pageSize={pageSize}
                    pageSizeOptions={[5, 10, 25]}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setPage(1);
                      setSelectedPlanId(null);
                      setRemoteDriversByPlan({});
                    }}
                  />

                </div>
              )}
            </>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">Drivers by plan</h3>
          <div className="space-y-4">
            {pagedPlans.map((p) => {
              const pageData = remoteDriversByPlan[p.id];
              const isOpen = selectedPlanId === p.id;
              const driversToShow = pageData?.drivers ?? (driversByPlan[p.id] ?? []).slice(0, DEFAULT_PAGE_SIZE);


              return (
                <div key={p.id} className="border rounded-md p-3 bg-white dark:bg-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{p.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{(driversByPlan[p.id]?.length ?? 0)} drivers</div>
                    </div>
                    <div>
                      <button
                        className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-sm"
                        onClick={() => toggleShowPlan(p)}
                      >
                        {isOpen ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-2 space-y-2">
                      {pageData?.loading && <div className="text-sm text-gray-500">Loading…</div>}

                      {pageData?.error && (
                        <div className="text-sm text-red-600">Error: {pageData.error}</div>
                      )}

                      {driversToShow.length === 0 && !pageData?.loading && (
                        <div className="text-sm text-gray-500">No drivers found.</div>
                      )}

                      {driversToShow.map((d) => {
                        const displayName = (d.name ?? "").toString().trim() || "Unknown Driver";
                        const displayContact = (d.email ?? "").toString().trim() || (d.phone ?? "").toString().trim() || "N/A";

                        return (
                          <div key={d.id} className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">{displayName}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 break-all">{displayContact}</div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                className="px-2 py-1 rounded-md bg-indigo-600 text-white text-sm"
                                onClick={() => openPaymentHistory(d.id)}
                              >
                                Payments
                              </button>
                            </div>
                          </div>
                        );
                      })}


                      {/* Pagination (only if remote results present) */}
                      {pageData && pageData.totalPages > 1 && (
                        <div className="flex items-center gap-2 justify-end pt-2">
                          <button
                            className="px-2 py-1 rounded-md bg-gray-100 text-sm"
                            onClick={() => changePlanDriversPage(p.id, Math.max(1, (pageData.page || 1) - 1))}
                            disabled={pageData.loading || (pageData.page || 1) <= 1}
                          >
                            Prev
                          </button>

                          <div className="text-sm text-gray-500">
                            Page {pageData.page} / {pageData.totalPages}
                          </div>

                          <button
                            className="px-2 py-1 rounded-md bg-gray-100 text-sm"
                            onClick={() => changePlanDriversPage(p.id, Math.min(pageData.totalPages, (pageData.page || 1) + 1))}
                            disabled={pageData.loading || (pageData.page || 1) >= pageData.totalPages}
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Unassigned block (unchanged) */}
            <div className="border rounded-md p-3 bg-white dark:bg-gray-800">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Unassigned</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{subscriptionStats.unassignedDriversCount} drivers</div>
                </div>
                <div>
                  <button
                    className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-sm"
                    onClick={() =>
                      setSelectedPlanId(selectedPlanId === "unassigned" ? null : "unassigned")
                    }
                  >
                    {selectedPlanId === "unassigned" ? "Hide" : "Show"}
                  </button>
                  {selectedPlanId === "unassigned" && (
                    <div className="mt-2 space-y-2">
                      {subscriptionStats.unassignedDrivers.length === 0 && (
                        <div className="text-sm text-gray-500">No unassigned drivers</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {selectedPlanId === "unassigned" && (
                <div className="mt-2 space-y-2">
                  {(driversByPlan["unassigned"] ?? []).length === 0 ? (
                    <div className="text-sm text-gray-500">No unassigned drivers</div>
                  ) : (
                    (driversByPlan["unassigned"] ?? []).map((d) => {
                      const displayName = (d.name || "").trim() || "User";
                      const displayContact = (d.email || "").trim() || (d.phone || "").trim() || "N/A";

                      return (
                        <div key={d.id} className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {displayName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {displayContact}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              className="px-2 py-1 rounded-md bg-indigo-600 text-white text-sm"
                              onClick={() => openPaymentHistory(d.id)}
                            >
                              Payments
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      <Modal
        open={showPlanModal}
        onClose={() => {
          setShowPlanModal(false);
          setIsViewMode(false);
        }}
        title={isViewMode ? "View plan" : editingPlan ? "Edit plan" : "Create plan"}
      >
        {isViewMode && editingPlan ? (
          <div className="space-y-4 p-2">
            <div>
              <div className="text-sm text-gray-500">Name</div>
              <div className="font-medium">{editingPlan.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Vehicle Type</div>
              <div className="font-medium">
                {editingPlan ? (
                  editingPlan.isUnlimited ? (
                    "Bike, Auto, Car (Economy, Premium)"
                  ) : (
                    (editingPlan.vehicleTypes?.length ?? 0) > 0
                      ? editingPlan.vehicleTypes?.map((v: string) =>
                        v.startsWith("car_")
                          ? v.includes("premium")
                            ? "Car (Premium)"
                            : "Car (Economy)"
                          : v.charAt(0).toUpperCase() + v.slice(1)
                      )
                        .join(", ")
                      : "—"
                  )
                ) : (
                  "—"
                )}
              </div>

            </div>


            <div>
              <div className="text-sm text-gray-500">Subscription Type</div>
              <div className="font-medium">
                {editingPlan.subscriptionType
                  ? editingPlan.subscriptionType.charAt(0).toUpperCase() +
                  editingPlan.subscriptionType.slice(1)
                  : "—"}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Price</div>
              <div className="font-medium">₹ {editingPlan.pricePerMonth ?? "—"}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Description</div>
              <div className="font-medium">{editingPlan.description ?? "—"}</div>
            </div>
          </div>
        ) : (
          <PlanFormModal
            open={showPlanModal}
            initial={mapPlanToFormInitial(editingPlan)}
            onClose={() => {
              setShowPlanModal(false);
              setIsViewMode(false);
            }}
            onSave={handleSavePlanFromForm}
          />
        )}
      </Modal>

      <Modal
        open={!!showPaymentsModalForDriver}
        onClose={() => setShowPaymentsModalForDriver(null)}
        title={showPaymentsModalForDriver ? `Payments for ${drivers.find((d) => d.id === showPaymentsModalForDriver)?.name ?? "driver"}` : "Payments"}
      >
        {showPaymentsModalForDriver && (
          <PaymentsView
            driver={drivers.find((d) => d.id === showPaymentsModalForDriver)!}
            payments={payments.filter((p) => p.driverId === showPaymentsModalForDriver)}
            plans={plans}
            onAdd={(payload) => addPayment(payload)}
          />
        )}
      </Modal>

      <DeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Plan"
        description="Are you sure you want to delete this plan? This action cannot be undone."
      />

      <CustomSnackbar
        message={snackbarMsg}
        severity={snackbarSeverity}
        open={snackbarOpen}
        onClose={closeSnackbar}
      />
    </div>
  );
}
