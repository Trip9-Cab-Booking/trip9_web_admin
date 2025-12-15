"use client";

import React, { useEffect, useMemo, useState } from "react";
import { axiosInstance } from "@/utils/axiosInstance";
import Pagination from "../ui/pagination";
import CustomSnackbar from "../CustomSnackbar";

type Role = "user" | "driver";

type Wallet = {
  id: string;
  ownerId?: string;
  walletId?: string;
  name: string;
  role: Role;
  phone?: string;
  email?: string;
  balance: number;
  locked: boolean;
};

type Transaction = {
  id: string;
  walletId?: string;
  type: "credit" | "debit" | "other";
  amount: number;
  date: string;
  note?: string;
};

export default function WalletManagement() {
  const [activeRole, setActiveRole] = useState<Role>("user");
  const [query, setQuery] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<{ fullName?: string; phone?: string; email?: string } | null>(null);
  const [selectedTxns, setSelectedTxns] = useState<Transaction[]>([]);
  const [showLockModal, setShowLockModal] = useState(false);
  const [modalTargetWallet, setModalTargetWallet] = useState<Wallet | null>(null);

  // Pagination States for User/Driver wallets
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Transaction pagination
  const [txnPage, setTxnPage] = useState(1);
  const [txnLimit] = useState(5);
  const [txnTotal, setTxnTotal] = useState(0);
  const [txnTotalPages, setTxnTotalPages] = useState(1);

  // Snackbar Notifications
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


  async function fetchWallets(role: Role, page: number, limit: number) {
    try {
      const res = await axiosInstance.get("/api/admin/getAllWallets", {
        params: {
          ownerType: role,
          page,
          limit,
        },
      });

      const apiWallets = res.data.data ?? [];
      const pagination = res.data.pagination ?? {};

      const mapped: Wallet[] = apiWallets.map((w: any) => ({
        id: w._id,
        walletId: w.walletId,
        name:
          w.fullName ??
          (`${w.firstName ?? ""} ${w.lastName ?? ""}`.trim() || "Unknown"),
        role: w.ownerType,
        ownerId: w.ownerId,
        phone: w.phone,
        email: w.email,
        balance: Number(w.balance ?? 0),
        locked: Boolean(w.isWalletLock),
      }));

      return {
        wallets: mapped,
        meta: {
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          totalPages: pagination.totalPages,
        },
      };
    } catch (err) {
      console.error("fetchWallets error:", err);
      return {
        wallets: [],
        meta: {
          page: 1,
          limit,
          total: 0,
          totalPages: 1,
        },
      };
    }
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

      const safePage = Number.isFinite(page) && page > 0 ? page : 1;
      const safeLimit =
        Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 5;

      const { wallets: fetched, meta } = await fetchWallets(
        activeRole,
        safePage,
        safeLimit
      );

      if (!mounted) return;

      setWallets(fetched);

      const safeTotal = Number.isFinite(meta.total) ? meta.total : 0;
      const safeTotalPages =
        Number.isFinite(meta.totalPages) && meta.totalPages > 0
          ? meta.totalPages
          : Math.max(1, Math.ceil(safeTotal / safeLimit));

      setTotal(safeTotal);
      setTotalPages(safeTotalPages);

      const first = fetched[0] ?? null;
      if (first) {
        setSelectedWalletId(first.id);
        fetchWalletDetails(
          first.ownerId ?? first.id,
          activeRole,
          txnPage,
          txnLimit
        );

      } else {
        setSelectedWalletId(null);
        setSelectedProfile(null);
        setSelectedTxns([]);
      }

      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [activeRole, page, pageSize]);


  async function fetchWalletDetails(
    ownerId: string,
    ownerType: Role,
    page: number,
    limit: number
  ) {
    setLoadingDetails(true);

    try {
      const res = await axiosInstance.get("/api/admin/getwalletsDetails", {
        params: {
          ownerId,
          ownerType,
          page,
          limit,
        },
      });

      const payload = res.data.data ?? {};

      /* Profile */
      setSelectedProfile(payload.profileDetails ?? null);

      /* Wallet details */
      const walletDetails = payload.walletDetails;
      if (walletDetails) {
        setWallets(prev =>
          prev.map(w =>
            w.ownerId === ownerId || w.walletId === walletDetails.walletId
              ? {
                ...w,
                walletId: walletDetails.walletId ?? w.walletId,
                balance: Number(walletDetails.balance ?? w.balance),
                locked: Boolean(walletDetails.isWalletLock ?? w.locked),
              }
              : w
          )
        );
      }

      /* Transactions */
      const history = payload.transactionHistory ?? {};
      const rows = history.rows ?? [];
      const pagination = history.pagination ?? {};

      const mappedTxns: Transaction[] = rows.map((r: any) => ({
        id: r.transactionId ?? crypto.randomUUID(),
        walletId: walletDetails?.walletId,
        type:
          r.transactionType === "payout"
            ? "credit"
            : ["ride", "subscription", "payment"].includes(r.transactionType)
              ? "debit"
              : "other",
        amount: Number(r.totalAmount ?? r.amount ?? 0),
        date: r.createdAt ?? r.date,
        note: r.transactionType ?? r.note,
      }));

      mappedTxns.sort((a, b) => +new Date(b.date) - +new Date(a.date));
      setSelectedTxns(mappedTxns);

      /* Pagination meta */
      setTxnPage(Number.isFinite(pagination.page) ? pagination.page : page);
      setTxnTotal(Number.isFinite(pagination.total) ? pagination.total : 0);
      setTxnTotalPages(
        Number.isFinite(pagination.totalPages) ? pagination.totalPages : 1
      );

    } catch (err) {
      console.error("fetchWalletDetails error:", err);
      setSelectedProfile(null);
      setSelectedTxns([]);
      setTxnTotal(0);
      setTxnTotalPages(1);
    } finally {
      setLoadingDetails(false);
    }
  }

  useEffect(() => {
    if (!selectedWalletId) return;

    const owner = wallets.find(w => w.id === selectedWalletId);
    if (!owner) return;

    fetchWalletDetails(
      owner.ownerId ?? owner.id,
      owner.role,
      txnPage,
      txnLimit
    );
  }, [selectedWalletId, txnPage]);

  function handleSelectWallet(w: Wallet) {
    setSelectedWalletId(w.id);
    setTxnPage(1);
  }

  const filtered = useMemo(
    () =>
      wallets.filter(
        (w) =>
          w.role === activeRole &&
          (w.name.toLowerCase().includes(query.toLowerCase()) ||
            (w.phone ?? "").includes(query) ||
            (w.email ?? "").includes(query))
      ),
    [wallets, activeRole, query]
  );

  const selectedWallet = useMemo(
    () => wallets.find((w) => w.id === selectedWalletId) ?? filtered[0] ?? null,
    [wallets, selectedWalletId, filtered]
  );

  const walletTxns = selectedTxns;

  function openLockModal(w: Wallet) {
    setModalTargetWallet(w);
    setShowLockModal(true);
  }

  async function updateWalletLockStatus(walletId: string, isLocked: boolean) {
    try {
      const res = await axiosInstance.patch(
        "/api/admin/walletStatuscheck",
        { isWalletLock: isLocked },
        { params: { walletId } }
      );
      return res.data;
    } catch (err) {
      console.error("Failed to update wallet lock status:", err);
      throw err;
    }
  }

  async function toggleLockWallet(w: Wallet | null) {
    if (!w) return;

    const newStatus = !w.locked;

    try {
      // Call PATCH API
      await updateWalletLockStatus(w.walletId!, newStatus);

      // Update UI state
      setWallets(prev =>
        prev.map(p =>
          p.id === w.id ? { ...p, locked: newStatus } : p
        )
      );

      setShowLockModal(false);
      setModalTargetWallet(null);

      openSnackbar(
        newStatus ? "Wallet locked successfully" : "Wallet unlocked successfully",
        "success"
      );
    } catch (err) {
      openSnackbar("Failed to update wallet status", "error");
    }
  }


  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold dark:text-white">Wallet Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage wallets for users and drivers — view balances, transactions and lock suspicious wallets.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left column */}
          <aside className="md:col-span-4 lg:col-span-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setActiveRole("user");
                  setPage(1);
                  setSelectedWalletId(null);
                }}
                className={`flex-1 py-2 rounded-md text-sm font-medium ${activeRole === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"}`}
              >
                Users
              </button>

              <button
                onClick={() => {
                  setActiveRole("driver");
                  setPage(1);
                  setSelectedWalletId(null);
                }}
                className={`flex-1 py-2 rounded-md text-sm font-medium ${activeRole === "driver" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"}`}
              >
                Drivers
              </button>

            </div>

            <div className="relative mb-3">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search by name / phone`} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600" />
              {query && <button onClick={() => setQuery("")} className="absolute right-2 top-2 text-xs text-gray-500 dark:text-gray-300">Clear</button>}
            </div>

            <div className="space-y-2 max-h-[56vh] overflow-auto pr-2">
              {loading && <div className="text-sm text-gray-500">Loading wallets...</div>}
              {!loading && filtered.length === 0 && <div className="text-sm text-gray-500 dark:text-gray-400">No {activeRole}s found.</div>}
              {filtered.map((w) => (
                <div
                  key={w.id}
                  onClick={() => handleSelectWallet(w)}
                  className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${selectedWalletId === w.id ? "bg-indigo-50 border border-indigo-100 dark:bg-indigo-900/30 dark:border-indigo-700" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{w.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{w.phone ?? w.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">₹{w.balance.toFixed(2)}</div>
                    <div className={`text-xs mt-1 ${w.locked ? "text-red-600" : "text-green-600"}`}>{w.locked ? "Locked" : "Active"}</div>
                  </div>
                </div>
              ))}

            </div>
            <div className="mt-3 border-t dark:border-gray-700 pt-3">
              <div className="text-xs text-gray-500 mb-2">
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, total)} of {total}
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => {
                  if (!Number.isFinite(newPage) || newPage < 1) return;
                  setPage(newPage);
                }}
                compact
              />

            </div>

          </aside>

          {/* Right column */}
          <main className="md:col-span-8 lg:col-span-8 space-y-6">
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              {!selectedWallet ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">Select a wallet from the left to view details.</div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 grid place-items-center font-bold text-indigo-700 dark:text-indigo-300">
                      {selectedWallet.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedProfile?.fullName ?? selectedWallet.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedWallet.role === "user" ? "User" : "Driver"} • {selectedProfile?.phone ?? selectedWallet.phone ?? selectedProfile?.email ?? selectedWallet.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Wallet balance</div>
                      <div className="text-2xl font-bold">₹{selectedWallet.balance.toFixed(2)}</div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => openLockModal(selectedWallet)} className={`px-4 py-2 rounded-md border transition-colors ${selectedWallet.locked ? "bg-yellow-50 border-yellow-300 text-yellow-800 dark:bg-yellow-900/20" : "bg-red-600 text-white border-red-600"}`}>{selectedWallet.locked ? "Unlock wallet" : "Lock wallet"}</button>

                      {/* <button onClick={() => alert("Open wallet top-up / payout flow (not implemented) ")} className="px-4 py-2 rounded-md border bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600">Actions</button> */}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Transaction history</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">{selectedWallet ? `Showing recent transactions for ${selectedProfile?.fullName ?? selectedWallet.name}` : "Select a wallet to see transactions"}</div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="py-2">Date</th>
                      <th className="py-2">Transaction ID</th>
                      <th className="py-2">Type</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingDetails && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-500">Loading transactions...</td>
                      </tr>
                    )}

                    {!loadingDetails && walletTxns.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-500">No transactions found</td>
                      </tr>
                    )}

                    {!loadingDetails && walletTxns.map((t) => (
                      <tr key={t.id} className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3">{new Date(t.date).toLocaleString()}</td>
                        <td className="py-3">{t.id}</td>
                        <td className="py-3 capitalize">{t.type}</td>
                        <td className={`py-3 font-medium ${t.type === "credit" ? "text-green-600" : t.type === "debit" ? "text-red-600" : "text-gray-700"}`}>₹{t.amount.toFixed(2)}</td>
                        <td className="py-3 text-gray-600 dark:text-gray-300">{t.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-right text-xs text-gray-500 dark:text-gray-400">Showing {walletTxns.length} transactions</div>
              {txnTotalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination
                    currentPage={txnPage}
                    totalPages={txnTotalPages}
                    onPageChange={(p) => {
                      if (!Number.isFinite(p) || p < 1) return;
                      setTxnPage(p);
                    }}
                    compact
                  />
                </div>
              )}
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total wallets (current tab)</div>
                <div className="text-xl font-bold mt-2">{filtered.length}</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total balance (current tab)</div>
                <div className="text-xl font-bold mt-2">₹{filtered.reduce((s, w) => s + w.balance, 0).toFixed(2)}</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">Locked wallets</div>
                <div className="text-xl font-bold mt-2">{filtered.filter((w) => w.locked).length}</div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Lock / Unlock confirmation modal */}
      {showLockModal && modalTargetWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg p-6 text-gray-900 dark:text-gray-100">
            <h4 className="text-lg font-semibold mb-2">{modalTargetWallet.locked ? "Unlock wallet" : "Lock wallet"}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {modalTargetWallet.locked
                ? "Are you sure you want to unlock this wallet? Unlocking will allow transactions again."
                : "Locking a wallet will prevent any outgoing transactions — use this for fraud or suspicious cases. This will not delete the wallet."}
            </p>

            <div className="flex items-center justify-end gap-2">
              <button onClick={() => { setShowLockModal(false); setModalTargetWallet(null); }} className="px-3 py-2 rounded-md border bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600">Cancel</button>
              <button onClick={() => toggleLockWallet(modalTargetWallet)} className={`px-3 py-2 rounded-md ${modalTargetWallet.locked ? "bg-yellow-50 border border-yellow-300 text-yellow-800 dark:bg-yellow-900/20" : "bg-red-600 text-white"}`}>{modalTargetWallet.locked ? "Unlock" : "Lock"}</button>
            </div>
          </div>
        </div>
      )}
      <CustomSnackbar
        message={snackbarMsg}
        severity={snackbarSeverity}
        open={snackbarOpen}
        onClose={closeSnackbar}
      />
    </div>
  );
}
