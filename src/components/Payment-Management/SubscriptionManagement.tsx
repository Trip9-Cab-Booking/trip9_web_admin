"use client";

import React, { useMemo, useState } from "react";

// Types
type Plan = {
  id: string;
  name: string;
  pricePerMonth: number;
  durationMonths: number; 
  description?: string;
  isActive: boolean;
};

type Driver = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  planId?: string | null;
  subscriptionStart?: string | null; 
  subscriptionEnd?: string | null;
};

type Payment = {
  id: string;
  driverId: string;
  amount: number;
  date: string;
  planId?: string | null;
};

// Small helpers
const formatCurrency = (n: number) => {
  return `₹${n.toFixed(2)}`;
};

const todayISO = () => new Date().toISOString();

// Mock data (in real app replace with API calls)
const mockPlans: Plan[] = [
  { id: "p1", name: "Basic", pricePerMonth: 199, durationMonths: 1, description: "Essential features", isActive: true },
  { id: "p2", name: "Pro", pricePerMonth: 499, durationMonths: 1, description: "Most popular", isActive: true },
  { id: "p3", name: "Enterprise", pricePerMonth: 1499, durationMonths: 1, description: "For large fleets", isActive: false },
];

const mockDrivers: Driver[] = [
  { id: "d1", name: "Arun Sharma", phone: "+91 98765 43210", email: "arun@example.com", planId: "p2", subscriptionStart: "2025-10-01T00:00:00.000Z", subscriptionEnd: "2025-11-01T00:00:00.000Z" },
  { id: "d2", name: "Sana Roy", phone: "+91 91234 56789", email: "sana@example.com", planId: "p1", subscriptionStart: "2025-09-10T00:00:00.000Z", subscriptionEnd: "2025-10-10T00:00:00.000Z" },
  { id: "d3", name: "Vikram Patel", phone: "+91 99887 66554", email: "vikram@example.com", planId: null },
  { id: "d4", name: "Ria Sen", phone: "+91 90000 11111", email: "ria@example.com", planId: "p2", subscriptionStart: "2025-11-01T00:00:00.000Z", subscriptionEnd: "2025-12-01T00:00:00.000Z" },
];

const mockPayments: Payment[] = [
  { id: "pay1", driverId: "d1", amount: 499, date: "2025-10-01T09:00:00.000Z", planId: "p2" },
  { id: "pay2", driverId: "d2", amount: 199, date: "2025-09-10T10:30:00.000Z", planId: "p1" },
  { id: "pay3", driverId: "d4", amount: 499, date: "2025-11-01T12:00:00.000Z", planId: "p2" },
];

// Pagination component (simple)
function Pagination({ current, total, onPage }: { current: number; total: number; onPage: (p: number) => void }) {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-2 mt-4">
      <button
        className="px-3 py-1 rounded-md bg-gray-100 disabled:opacity-50"
        onClick={() => onPage(Math.max(1, current - 1))}
        disabled={current === 1}
      >
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`px-3 py-1 rounded-md ${p === current ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
        >
          {p}
        </button>
      ))}
      <button
        className="px-3 py-1 rounded-md bg-gray-100 disabled:opacity-50"
        onClick={() => onPage(Math.min(total, current + 1))}
        disabled={current === total}
      >
        Next
      </button>
    </div>
  );
}

// Modal component (very small)
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children?: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{title}</h3>
          <button onClick={onClose} className="text-gray-600">Close</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default function SubscriptionManagement() {
  // state
  const [plans, setPlans] = useState<Plan[]>(mockPlans);
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);

  // UI state
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [showPaymentsModalForDriver, setShowPaymentsModalForDriver] = useState<string | null>(null);

  // Pagination for plans list
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPlanPages = Math.max(1, Math.ceil(plans.length / pageSize));
  const pagedPlans = useMemo(() => plans.slice((page - 1) * pageSize, page * pageSize), [plans, page]);

  // Calculated stats
  const activeSubscriptions = useMemo(() => {
    const now = new Date();
    return drivers.filter((d) => d.subscriptionStart && d.subscriptionEnd && new Date(d.subscriptionEnd) > now).length;
  }, [drivers]);

  const revenue = useMemo(() => payments.reduce((s, p) => s + p.amount, 0), [payments]);

  // drivers grouped by plan
  const driversByPlan = useMemo(() => {
    const map: Record<string, Driver[]> = {};
    plans.forEach((p) => (map[p.id] = []));
    map["unassigned"] = [];
    drivers.forEach((d) => {
      if (d.planId && map[d.planId]) map[d.planId].push(d);
      else map["unassigned"].push(d);
    });
    return map;
  }, [drivers, plans]);

  // Handlers
  function handleOpenCreatePlan() {
    setEditingPlan(null);
    setShowPlanModal(true);
  }

  function handleEditPlan(p: Plan) {
    setEditingPlan(p);
    setShowPlanModal(true);
  }

  function handleDeletePlan(planId: string) {
    if (!confirm("Delete this plan? This will not delete subscriptions for drivers automatically.")) return;
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    // optionally unassign drivers
    setDrivers((prev) => prev.map((d) => (d.planId === planId ? { ...d, planId: null } : d)));
  }

  function savePlan(payload: Partial<Plan> & { id?: string }) {
    if (payload.id) {
      setPlans((prev) => prev.map((p) => (p.id === payload.id ? { ...(payload as Plan) } : p)));
    } else {
  const id = `p_${Math.random().toString(36).slice(2, 9)}`;
  const { id: _payloadId, ...payloadWithoutId } = payload as Partial<Plan> & { id?: string };
  setPlans((prev) => [{ id, ...(payloadWithoutId as Omit<Plan, "id">) }, ...prev]);
}
    setShowPlanModal(false);
  }

  function openPaymentHistory(driverId: string) {
    setShowPaymentsModalForDriver(driverId);
  }

  function addPayment(payload: { driverId: string; amount: number; planId?: string | null }) {
    const newPayment: Payment = { id: `pay_${Math.random().toString(36).slice(2, 9)}`, driverId: payload.driverId, amount: payload.amount, planId: payload.planId ?? null, date: todayISO() };
    setPayments((p) => [newPayment, ...p]);
    // also update driver subscription if a plan was bought
    if (payload.planId) {
      const start = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + 1); // assume 1 month subscription purchase
      setDrivers((d) => d.map((dr) => (dr.id === payload.driverId ? { ...dr, planId: payload.planId, subscriptionStart: start.toISOString(), subscriptionEnd: end.toISOString() } : dr)));
    }
  }

  // small UI components inside file for brevity
  function PlanCard({ plan }: { plan: Plan }) {
    return (
      <div className="border rounded-md p-4 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-semibold">{plan.name}</h4>
            <p className="text-sm text-gray-500">{plan.description}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">{formatCurrency(plan.pricePerMonth)}</div>
            <div className="text-sm text-gray-500">/ month</div>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm" onClick={() => handleEditPlan(plan)}>
            Edit
          </button>
          <button className="px-3 py-1 rounded-md bg-red-100 text-red-700 text-sm" onClick={() => handleDeletePlan(plan.id)}>
            Delete
          </button>
          <button className="px-3 py-1 rounded-md bg-gray-100 text-sm" onClick={() => setSelectedPlanId(plan.id)}>
            View drivers
          </button>
        </div>
      </div>
    );
  }

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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-500">Active subscriptions</div>
          <div className="text-2xl font-bold">{activeSubscriptions}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-500">Revenue from subscriptions</div>
          <div className="text-2xl font-bold">{formatCurrency(revenue)}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-500">Total plans</div>
          <div className="text-2xl font-bold">{plans.length}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Plans list */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Plans</h3>
            <div className="text-sm text-gray-500">Showing {pagedPlans.length} of {plans.length}</div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {pagedPlans.map((p) => (
              <PlanCard key={p.id} plan={p} />
            ))}
          </div>

          <Pagination current={page} total={totalPlanPages} onPage={setPage} />
        </div>

        {/* Drivers by plan */}
        <div>
          <h3 className="text-lg font-medium mb-3">Drivers by plan</h3>
          <div className="space-y-4">
            {plans.map((p) => (
              <div key={p.id} className="border rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-gray-500">{driversByPlan[p.id]?.length ?? 0} drivers</div>
                  </div>
                  <div>
                    <button
                      className="px-2 py-1 rounded-md bg-gray-100 text-sm"
                      onClick={() => setSelectedPlanId(selectedPlanId === p.id ? null : p.id)}
                    >
                      {selectedPlanId === p.id ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {selectedPlanId === p.id && (
                  <div className="mt-2 space-y-2">
                    {(driversByPlan[p.id] ?? []).map((d) => (
                      <div key={d.id} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{d.name}</div>
                          <div className="text-xs text-gray-500">{d.email ?? d.phone}</div>
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

            {/* Unassigned drivers */}
            <div className="border rounded-md p-3">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-medium">Unassigned</div>
                  <div className="text-sm text-gray-500">{driversByPlan["unassigned"]?.length ?? 0} drivers</div>
                </div>
                <div>
                  <button className="px-2 py-1 rounded-md bg-gray-100 text-sm" onClick={() => setSelectedPlanId(selectedPlanId === "unassigned" ? null : "unassigned")}>{selectedPlanId === "unassigned" ? "Hide" : "Show"}</button>
                </div>
              </div>

              {selectedPlanId === "unassigned" && (
                <div className="mt-2 space-y-2">
                  {(driversByPlan["unassigned"] ?? []).map((d) => (
                    <div key={d.id} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{d.name}</div>
                        <div className="text-xs text-gray-500">{d.email ?? d.phone}</div>
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

      {/* Plan create/edit modal */}
      <Modal open={showPlanModal} onClose={() => setShowPlanModal(false)} title={editingPlan ? "Edit plan" : "Create plan"}>
        <PlanForm initial={editingPlan ?? undefined} onCancel={() => setShowPlanModal(false)} onSave={(p) => savePlan(p)} />
      </Modal>

      {/* Payments modal */}
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
    </div>
  );
}

// Plan form component
function PlanForm({ initial, onCancel, onSave }: { initial?: Partial<Plan> & { id?: string }; onCancel: () => void; onSave: (p: Partial<Plan> & { id?: string }) => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.pricePerMonth ?? 0);
  const [duration, setDuration] = useState(initial?.durationMonths ?? 1);
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border rounded-md p-2" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">Price / month</label>
          <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="mt-1 block w-full border rounded-md p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Duration (months)</label>
          <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="mt-1 block w-full border rounded-md p-2" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="mt-1 block w-full border rounded-md p-2" />
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          <span className="text-sm">Active</span>
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <button className="px-4 py-2 rounded-md bg-gray-100" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="px-4 py-2 rounded-md bg-indigo-600 text-white"
          onClick={() => onSave({ id: initial?.id, name, pricePerMonth: price, durationMonths: duration, description: desc, isActive })}
        >
          Save
        </button>
      </div>
    </div>
  );
}

// Payments view
function PaymentsView({ driver, payments, plans, onAdd }: { driver: Driver; payments: Payment[]; plans: Plan[]; onAdd: (payload: { driverId: string; amount: number; planId?: string | null }) => void }) {
  const [amount, setAmount] = useState<number>(0);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(plans[0]?.id ?? null);

  return (
    <div>
      <div className="mb-4">
        <div className="text-sm text-gray-500">Driver</div>
        <div className="font-medium">{driver.name}</div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-500">Add payment / charge</div>
        <div className="flex gap-2 mt-2">
          <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="p-2 border rounded-md w-32" placeholder="Amount" />
          <select value={selectedPlanId ?? ""} onChange={(e) => setSelectedPlanId(e.target.value ?? null)} className="p-2 border rounded-md">
            <option value="">Manual</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - {formatCurrency(p.pricePerMonth)}
              </option>
            ))}
          </select>
          <button
            className="px-3 py-1 rounded-md bg-indigo-600 text-white"
            onClick={() => {
              if (!amount || amount <= 0) return alert("Enter amount");
              onAdd({ driverId: driver.id, amount, planId: selectedPlanId });
              setAmount(0);
            }}
          >
            Add
          </button>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Payment history</h4>
        <div className="space-y-2 max-h-64 overflow-auto">
          {payments.length === 0 && <div className="text-sm text-gray-500">No payments yet</div>}
          {payments.map((p) => (
            <div key={p.id} className="flex justify-between items-center border rounded p-2">
              <div>
                <div className="font-medium">{formatCurrency(p.amount)}</div>
                <div className="text-xs text-gray-500">{new Date(p.date).toLocaleString()}</div>
              </div>
              <div className="text-sm text-gray-500">{plans.find((pl) => pl.id === p.planId)?.name ?? "Manual"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
