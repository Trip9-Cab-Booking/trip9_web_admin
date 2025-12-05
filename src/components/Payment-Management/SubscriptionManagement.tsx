"use client";

import React, { useMemo, useState } from "react";
import { Plan as TPlan, Driver as TDriver, Payment as TPayment, formatCurrency, todayISO } from "../../types/types";
import PlanCard from "../ui/plancard/PlanCard";
import Modal from "../ui/modal/Modal";
import PlanForm from "../ui/planForm/PlanForm";
import PaymentsView from "../ui/payment-view/PaymentsView"
import { axiosInstance } from "@/utils/axiosInstance";
import { duration } from "@mui/material";
import CustomSnackbar from "../CustomSnackbar";


const mockPlans: TPlan[] = [
  {
    id: "p1",
    name: "Daily",
    pricePerMonth: 199,
    durationMonths: 1,
    description: "Essential features",
    isActive: true,
    rideLimit: 10,
    rideLimitPeriod: "daily",
    vehicleTypes: ["bike", "auto", "car_economy"],
    vehiclePricing: {
      bike: { price: 49, durationDays: 1, rideLimit: 12 },
      auto: { price: 79, durationDays: 1, rideLimit: 10 },
      car_economy: { price: 99, durationDays: 1, rideLimit: 8 },
    },
  },
  {
    id: "p2",
    name: "Weekly",
    pricePerMonth: 499,
    durationMonths: 1,
    description: "Most popular",
    isActive: true,
    vehicleTypes: ["car_economy", "car_premium"],
    vehiclePricing: {
      car_economy: { price: 399, durationDays: 7 },
      car_premium: { price: 699, durationDays: 7 },
    },
  },
  {
    id: "p3",
    name: "Monthly",
    pricePerMonth: 1499,
    durationMonths: 1,
    description: "For large fleets",
    isActive: false,
    vehicleTypes: ["car_economy", "car_premium", "auto", "bike"],
    vehiclePricing: {
      car_economy: { price: 1299, durationDays: 30 },
      car_premium: { price: 1999, durationDays: 30 },
      auto: { price: 899, durationDays: 30 },
      bike: { price: 599, durationDays: 30 },
    },
  },
  {
    id: "p4",
    name: "Unlimited",
    pricePerMonth: 2599,
    durationMonths: 1,
    description: "Most popular features",
    isActive: false,
    vehicleTypes: ["car_premium", "auto"],
    vehiclePricing: {
      car_premium: { price: 2599, durationDays: 30 },
      auto: { price: 1599, durationDays: 30 },
    },
  },
];

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

export default function SubscriptionManagement() {
  const [plans, setPlans] = useState<TPlan[]>(mockPlans);
  const [drivers, setDrivers] = useState<TDriver[]>(mockDrivers);
  const [payments, setPayments] = useState<TPayment[]>(mockPayments);

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TPlan | null>(null);
  const [showPaymentsModalForDriver, setShowPaymentsModalForDriver] = useState<string | null>(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPlanPages = Math.max(1, Math.ceil(plans.length / pageSize));
  const pagedPlans = useMemo(() => plans.slice((page - 1) * pageSize, page * pageSize), [plans, page]);

  // snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info">("info");

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
    drivers.forEach((d) => {
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
    setShowPlanModal(true);
  }

  function handleEditPlan(p: TPlan) {
    setEditingPlan(p);
    setShowPlanModal(true);
  }

  function handleDeletePlan(planId: string) {
    if (!confirm("Delete this plan? This will not delete subscriptions for drivers automatically.")) return;
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    setDrivers((prev) => prev.map((d) => (d.planId === planId ? { ...d, planId: null } : d)));
  }

  async function handleSavePlan(payload: Partial<TPlan> & { id?: string }) {
    if (payload.id) {
      // UPDATE logic remains same (PUT) — you can also use snackbar there
      console.log("Updated!!!");
      openSnackbar("Plan updated (local)", "success");
      return;
    }

    setIsSavingPlan(true);

    try {
      const vehicleTypes = payload.vehicleTypes ?? [];
      const vehiclePricing = payload.vehiclePricing ?? {};

      const subscriptionType = payload.name?.toLowerCase().trim();

      const requests = vehicleTypes.map((vt) => {
        const mapped = mapVehicleType(vt);
        const pricing = vehiclePricing[vt] ?? {};
        const days = pricing.durationDays;

        const apiPayload = {
          subscriptionType,
          days,
          vehicleType: mapped.vehicleType,
          category: mapped.category,
          rideLimit: String(pricing.rideLimit ?? payload.rideLimit ?? ""),
          price: pricing.price ?? payload.pricePerMonth,
          description: payload.description ?? "",
        };

        return axiosInstance.post("/api/subscription/subscription-plan/create", apiPayload);
      });

      await Promise.all(requests);

      openSnackbar("Subscription plans created successfully!", "success");
      setShowPlanModal(false);
    } catch (err: any) {
      console.error(err);
      const message = err?.response?.data?.message ?? err?.message ?? "Failed to create subscription plans.";
      openSnackbar(message, "error");
    } finally {
      setIsSavingPlan(false);
    }
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

  // async function handleAddPayment(payload: { driverId: string; amount: number; planId?: string | null }) {
  //   setIsAddingPayment(true);
  //   const tempPayment: TPayment = {
  //     id: `temp_${Math.random().toString(36).slice(2, 9)}`,
  //     driverId: payload.driverId,
  //     amount: payload.amount,
  //     date: new Date().toISOString(),
  //     planId: payload.planId ?? null,
  //   };

  //   setPayments((p) => [tempPayment, ...p]);

  //   const previousDrivers = drivers;
  //   if (payload.planId) {
  //     const start = new Date();
  //     const end = new Date();
  //     end.setMonth(end.getMonth() + 1); // your existing logic
  //     setDrivers((d) =>
  //       d.map((dr) => (dr.id === payload.driverId ? { ...dr, planId: payload.planId, subscriptionStart: start.toISOString(), subscriptionEnd: end.toISOString() } : dr))
  //     );
  //   }

  //   try {
  //     const res = await fetch("/api/payments", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });

  //     if (!res.ok) throw new Error(`Failed to create payment: ${res.status}`);

  //     const created: TPayment = await res.json();

  //     // replace temp payment with server response (match by temp id)
  //     setPayments((p) => [created, ...p.filter((x) => x.id !== tempPayment.id)]);
  //   } catch (err) {
  //     console.error(err);
  //     // rollback optimistic updates
  //     setPayments((p) => p.filter((x) => x.id !== tempPayment.id));
  //     setDrivers(previousDrivers);
  //     alert("Failed to add payment.");
  //   } finally {
  //     setIsAddingPayment(false);
  //   }
  // }


  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Subscription Payment Management (Drivers)</h2>
        <div className="flex gap-3">
          <button onClick={handleOpenCreatePlan} className="px-4 py-2 bg-indigo-600 text-white rounded-md">
            Create Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Active subscriptions</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeSubscriptions}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Revenue from subscriptions</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(revenue)}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total plans</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{plans.length}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Plans</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">Showing {pagedPlans.length} of {plans.length}</div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {pagedPlans.map((p) => (
              <PlanCard key={p.id} plan={p} onEdit={handleEditPlan} onDelete={handleDeletePlan} onViewDrivers={(id) => setSelectedPlanId(id)} />
            ))}
          </div>
          {/* <Pagination current={page} total={totalPlanPages} onPage={setPage} /> */}
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-gray-100">Drivers by plan</h3>
          <div className="space-y-4">
            {plans.map((p) => (
              <div key={p.id} className="border rounded-md p-3 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{p.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{driversByPlan[p.id]?.length ?? 0} drivers</div>
                  </div>
                  <div>
                    <button className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-sm" onClick={() => setSelectedPlanId(selectedPlanId === p.id ? null : p.id)}>
                      {selectedPlanId === p.id ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {selectedPlanId === p.id && (
                  <div className="mt-2 space-y-2">
                    {(driversByPlan[p.id] ?? []).map((d) => (
                      <div key={d.id} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{d.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{d.email ?? d.phone}</div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-2 py-1 rounded-md bg-indigo-600 text-white text-sm" onClick={() => openPaymentHistory(d.id)}>
                            Payments
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="border rounded-md p-3 bg-white dark:bg-gray-800">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Unassigned</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{driversByPlan["unassigned"]?.length ?? 0} drivers</div>
                </div>
                <div>
                  <button className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-sm" onClick={() => setSelectedPlanId(selectedPlanId === "unassigned" ? null : "unassigned")}>{selectedPlanId === "unassigned" ? "Hide" : "Show"}</button>
                </div>
              </div>

              {selectedPlanId === "unassigned" && (
                <div className="mt-2 space-y-2">
                  {(driversByPlan["unassigned"] ?? []).map((d) => (
                    <div key={d.id} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{d.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{d.email ?? d.phone}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-2 py-1 rounded-md bg-indigo-600 text-white text-sm" onClick={() => openPaymentHistory(d.id)}>
                          Payments
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal open={showPlanModal} onClose={() => setShowPlanModal(false)} title={editingPlan ? "Edit plan" : "Create plan"}>
        {/* <PlanForm initial={editingPlan ?? undefined} onCancel={() => setShowPlanModal(false)} onSave={(p) => savePlan(p)} /> */}
        <PlanForm initial={editingPlan ?? undefined} onCancel={() => setShowPlanModal(false)} onSave={(p) => handleSavePlan(p)} />
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
          // <PaymentsView
          //   driver={drivers.find((d) => d.id === showPaymentsModalForDriver)!}
          //   payments={payments.filter((p) => p.driverId === showPaymentsModalForDriver)}
          //   plans={plans}
          //   onAdd={(payload) => handleAddPayment(payload)}
          // />
        )}
      </Modal>

      <CustomSnackbar
        message={snackbarMsg}
        severity={snackbarSeverity}
        open={snackbarOpen}
        onClose={closeSnackbar}
      />

    </div>
  );
}
