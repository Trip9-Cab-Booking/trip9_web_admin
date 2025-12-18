"use client";

import React, { useEffect, useMemo, useState } from "react";
import Pagination from "../ui/pagination";

type RefundStatus = "initiated" | "processed" | "failed";

type Refund = {
  id: string;
  rideId: string;
  originalTransactionId: string;
  user: string;
  amount: number;
  currency?: string;
  initiatedAt: string;
  status: RefundStatus;
  note?: string;
};

// Replace this with your real data / API
const MOCK_REFUNDS: Refund[] = Array.from({ length: 123 }).map((_, i) => ({
  id: `r_${1000 + i}`,
  rideId: `ride_${400 + i}`,
  originalTransactionId: `tx_${8000 + i}`,
  user: i % 3 === 0 ? "Ranjima Ghosh" : i % 3 === 1 ? "Amit Roy" : "S. Banerjee",
  amount: Math.round((Math.random() * 500 + 20) * 100) / 100,
  currency: "INR",
  initiatedAt: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
  status: i % 10 === 0 ? "failed" : i % 4 === 0 ? "processed" : "initiated",
  note: i % 7 === 0 ? "Auto generated note" : undefined,
}));

export default function RefundManagementComponent() {
  const [refunds, setRefunds] = useState<Refund[]>(MOCK_REFUNDS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RefundStatus>("all");
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Refund | null>(null);

  // Form state for initiate
  const [formRideId, setFormRideId] = useState("");
  const [formOriginalTx, setFormOriginalTx] = useState("");
  const [formUser, setFormUser] = useState("");
  const [formAmount, setFormAmount] = useState<number | "">("");
  const [formFullRefund, setFormFullRefund] = useState(true);
  const [formNote, setFormNote] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtered data (search + status)
  const filtered = useMemo(() => {
    return refunds.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return [r.id, r.rideId, r.originalTransactionId, r.user, String(r.amount)].some((field) =>
        field.toLowerCase().includes(q)
      );
    });
  }, [refunds, statusFilter, query]);

  // total pages based on filtered results
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  // Ensure page stays within bounds if filters/pageSize change
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  // Reset page to 1 when user changes query or filter or pageSize (common UX)
  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, pageSize]);

  // Items for the current page
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  function openInitiateModal(existing?: Refund) {
    if (existing) {
      setEditTarget(existing);
      setFormRideId(existing.rideId);
      setFormOriginalTx(existing.originalTransactionId);
      setFormUser(existing.user);
      setFormAmount(existing.amount);
      setFormFullRefund(false);
      setFormNote(existing.note ?? "");
    } else {
      setEditTarget(null);
      setFormRideId("");
      setFormOriginalTx("");
      setFormUser("");
      setFormAmount("");
      setFormFullRefund(true);
      setFormNote("");
    }
    setShowInitiateModal(true);
  }

  function submitInitiate() {
    if (!formRideId || !formOriginalTx || !formUser || formAmount === "" || Number(formAmount) <= 0) {
      alert("Please fill required fields and provide a valid amount.");
      return;
    }

    if (editTarget) {
      setRefunds((prev) => prev.map((r) => (r.id === editTarget.id ? { ...r, amount: Number(formAmount), note: formNote } : r)));
      setShowInitiateModal(false);
      setEditTarget(null);
      return;
    }

    const newRefund: Refund = {
      id: `r_${Math.floor(Math.random() * 90000) + 1000}`,
      rideId: formRideId,
      originalTransactionId: formOriginalTx,
      user: formUser,
      amount: Number(formAmount),
      currency: "INR",
      initiatedAt: new Date().toISOString(),
      status: "initiated",
      note: formNote || undefined,
    };
    setRefunds((prev) => [newRefund, ...prev]);
    setShowInitiateModal(false);
    setPage(1);
  }

  function simulateProcess(refundId: string, succeed = true) {
    setRefunds((prev) => prev.map((r) => (r.id === refundId ? { ...r, status: succeed ? "processed" : "failed" } : r)));
  }

  function cancelRefund(refundId: string) {
    if (!confirm("Are you sure you want to cancel this refund request?")) return;
    setRefunds((prev) => prev.filter((r) => r.id !== refundId));
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Refund Management</h1>
            <p className="text-sm text-gray-600">Initiate and track refunds — map each refund to the ride and the original payment transaction.</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => openInitiateModal()} className="px-4 py-2 rounded-md bg-indigo-600 text-white">
              Initiate refund
            </button>
            <div className="text-sm text-gray-500">
              Total refunds: <span className="font-semibold">{refunds.length}</span>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by refund ID, ride ID, tx ID, user" className="border rounded-md px-3 py-2 text-sm w-80" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="border rounded-md px-3 py-2 text-sm">
                <option value="all">All statuses</option>
                <option value="initiated">Initiated</option>
                <option value="processed">Processed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{filtered.length}</span> results
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {pageItems.map((r) => (
            <div key={r.id} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">Refund ID</div>
                  <div className="text-sm font-semibold">{r.id}</div>
                  <div className="text-sm text-gray-500">• Ride</div>
                  <div className="text-sm font-semibold">{r.rideId}</div>
                  <div className="text-sm text-gray-500">• Txn</div>
                  <div className="text-sm font-semibold">{r.originalTransactionId}</div>
                </div>

                <div className="mt-2 text-sm text-gray-600">
                  User: <span className="font-medium">{r.user}</span>
                </div>
                <div className="mt-1 text-sm">
                  Amount: <span className="font-semibold">₹{r.amount.toFixed(2)}</span>
                </div>
                <div className="mt-1 text-xs text-gray-500">Initiated: {new Date(r.initiatedAt).toLocaleString()}</div>
                {r.note && <div className="mt-1 text-sm text-gray-700">Note: {r.note}</div>}
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="flex gap-2">
                  {r.status === "initiated" && (
                    <>
                      <button onClick={() => simulateProcess(r.id, true)} className="px-3 py-1 rounded-md bg-green-600 text-white text-sm">
                        Mark processed
                      </button>
                      <button onClick={() => simulateProcess(r.id, false)} className="px-3 py-1 rounded-md bg-red-600 text-white text-sm">
                        Mark failed
                      </button>
                    </>
                  )}

                  <button onClick={() => openInitiateModal(r)} className="px-3 py-1 rounded-md border bg-gray-50 text-sm">
                    Edit
                  </button>
                  <button onClick={() => cancelRefund(r.id)} className="px-3 py-1 rounded-md border bg-gray-50 text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}

          {pageItems.length === 0 && <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">No refunds found.</div>}
        </div>

        {/* Pagination component */}
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
            siblingCount={1}
          // showFirstLast={true}
          />
        </div>
      </div>

      {/* Initiate / Edit modal */}
      {showInitiateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">{editTarget ? "Edit refund" : "Initiate refund"}</h3>
            <p className="text-sm text-gray-600 mb-4">Map this refund to the ride ID and the original payment transaction. Choose full or partial refund amount.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600">Ride ID</label>
                <input value={formRideId} onChange={(e) => setFormRideId(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="block text-xs text-gray-600">Original transaction ID</label>
                <input value={formOriginalTx} onChange={(e) => setFormOriginalTx(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="block text-xs text-gray-600">User</label>
                <input value={formUser} onChange={(e) => setFormUser(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="block text-xs text-gray-600">Full refund?</label>
                <div className="flex gap-3 items-center mt-1">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={formFullRefund} onChange={() => setFormFullRefund(true)} /> Full
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" checked={!formFullRefund} onChange={() => setFormFullRefund(false)} /> Partial
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600">Amount (INR)</label>
                <input value={formAmount as any} onChange={(e) => setFormAmount(e.target.value === "" ? "" : Number(e.target.value))} type="number" step="0.01" className="w-full border rounded-md px-3 py-2 text-sm" />
                <div className="text-xs text-gray-500 mt-1">If full refund is selected, enter the total amount to refund.</div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600">Note (optional)</label>
                <textarea value={formNote} onChange={(e) => setFormNote(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" rows={3}></textarea>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => { setShowInitiateModal(false); setEditTarget(null); }} className="px-3 py-2 rounded-md border bg-gray-100">
                Cancel
              </button>
              <button onClick={submitInitiate} className="px-4 py-2 rounded-md bg-indigo-600 text-white">
                {editTarget ? "Save changes" : "Create refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: RefundStatus }) {
  let color = "bg-gray-200 text-gray-800";
  if (status === "initiated") color = "bg-yellow-100 text-yellow-800";
  if (status === "processed") color = "bg-green-100 text-green-800";
  if (status === "failed") color = "bg-red-100 text-red-800";
  return <div className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>{status}</div>;
}
