"use client";

import React, { useEffect, useMemo, useState } from "react";
import { axiosInstance } from "@/utils/axiosInstance";
import Pagination from "../ui/pagination";

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
  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [txnPage, setTxnPage] = useState<number>(1);
  const [txnLimit, setTxnLimit] = useState<number>(2);
  const [txnTotal, setTxnTotal] = useState<number>(0);
  const [txnTotalPages, setTxnTotalPages] = useState<number>(0);


  async function fetchWallets(role: Role, page: number, limit: number) {
    try {
      const res = await axiosInstance.get(
        `/api/admin/getAllWallets?ownerType=${role}&page=${page}&limit=${limit}`
      );
      console.log("fetchWallets response:", res?.data);
      const apiWallets = res.data.data ?? [];

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
        pagination: {
          page: res.data.page,
          limit: res.data.limit,
          total: res.data.total,
          totalPages: res.data.totalPages,
        },
      };
    } catch (err) {
      console.error("fetchWallets error:", err);
      return {
        wallets: [],
        pagination: { page: 1, limit: 2, total: 0, totalPages: 1 },
      };
    }
  }

  async function fetchWalletDetails(ownerId: string, ownerType: Role, txnPage = 1, txnLimit = 2) {
    setLoadingDetails(true);
    try {
      const res = await axiosInstance.get(
        `/api/admin/getwalletsDetails?ownerId=${encodeURIComponent(ownerId)}&ownerType=${encodeURIComponent(ownerType)}&txnPage=${txnPage}&txnLimit=${txnLimit}`
      );
      const payload = res.data.data;

      const profile = payload?.profileDetails ?? null;
      setSelectedProfile(profile);

      const walletDetails = payload?.walletDetails;
      if (walletDetails) {
        setWallets(prev =>
          prev.map(w =>
            (w.walletId === walletDetails.walletId || w.ownerId === ownerId)
              ? {
                ...w,
                walletId: walletDetails.walletId ?? w.walletId,
                balance: Number(walletDetails.balance ?? w.balance ?? 0),
                locked: Boolean(walletDetails.isWalletLock ?? w.locked)
              }
              : w
          )
        );
      }

      // transactions: server-sent rows
      const rows = payload?.transactionHistory?.rows ?? [];

      // map transactions
      const mappedTxns: Transaction[] = rows.map((r: any) => {
        const txType: "credit" | "debit" | "other" = (() => {
          if (r.transactionType === "payout") return "credit";
          if (r.transactionType === "ride" || r.transactionType === "subscription" || r.transactionType === "payment") return "debit";
          return "other";
        })();

        return {
          id: r.transactionId ?? `${Math.random().toString(36).slice(2, 9)}`,
          walletId: walletDetails?.walletId,
          type: txType,
          amount: Number(r.totalAmount ?? r.amount ?? 0),
          date: r.createdAt ?? r.date,
          note: r.transactionType ?? r.note
        };
      });

      // sort if server doesn't already
      mappedTxns.sort((a, b) => +new Date(b.date) - +new Date(a.date));

      setSelectedTxns(mappedTxns);

      const txnMeta = payload?.transactionHistory;
      if (txnMeta && (txnMeta.page || txnMeta.totalPages || txnMeta.total)) {
        setTxnPage(Number(txnMeta.page ?? txnPage));
        setTxnLimit(Number(txnMeta.limit ?? txnLimit));
        setTxnTotal(Number(txnMeta.total ?? mappedTxns.length));
        setTxnTotalPages(Number(txnMeta.totalPages ?? Math.ceil((txnMeta.total ?? mappedTxns.length) / (txnMeta.limit ?? txnLimit))));
      } else {
        setTxnPage(txnPage);
        setTxnLimit(txnLimit);
        setTxnTotal(mappedTxns.length);
        setTxnTotalPages(Math.max(1, Math.ceil(mappedTxns.length / txnLimit)));
      }

    } catch (err) {
      console.error("fetchWalletDetails error:", err);
      setSelectedProfile(null);
      setSelectedTxns([]);
      setTxnPage(1);
      setTxnLimit(2);
      setTxnTotal(0);
      setTxnTotalPages(0);
    } finally {
      setLoadingDetails(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

      const { wallets: fetched, pagination } = await fetchWallets(activeRole, page, pageSize);

      if (!mounted) return;

      setWallets(fetched);
      setTotalPages(pagination.totalPages);
      setTotal(pagination.total);

      const first = fetched[0] ?? null;
      if (first) {
        setSelectedWalletId(first.id);
        await fetchWalletDetails(first.ownerId ?? first.id, activeRole);
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

  async function handleSelectWallet(w: Wallet) {
    setSelectedWalletId(w.id);
    setTxnPage(1);
  }

  useEffect(() => {
    if (!selectedWalletId) return;
    const owner = wallets.find(w => w.id === selectedWalletId);
    if (!owner) return;
    fetchWalletDetails(owner.ownerId ?? owner.id, owner.role, txnPage, txnLimit);
  }, [selectedWalletId, txnPage, txnLimit]);

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

  function toggleLockWallet(w: Wallet | null) {
    if (!w) return;
    setWallets(prev => prev.map(p => p.id === w.id ? { ...p, locked: !p.locked } : p));
    setShowLockModal(false);
    setModalTargetWallet(null);
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left column */}
          <aside className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
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
            <Pagination currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              pageSizeOptions={[10, 25, 50]}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }} />
          </aside>

          {/* Right column */}
          <main className="md:col-span-3 space-y-6">
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

                      <button onClick={() => alert("Open wallet top-up / payout flow (not implemented) ")} className="px-4 py-2 rounded-md border bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600">Actions</button>
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
              <Pagination
                currentPage={txnPage}
                totalPages={txnTotalPages}
                // keep same appearance: remove first/last etc in component props if needed
                onPageChange={(p) => setTxnPage(p)}
                compact={true}
                siblingCount={1}
                showFirstLast={false}
              />
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
              <button onClick={() => toggleLockWallet(modalTargetWallet)} className={`px-3 py-2 rounded-md ${modalTargetWallet.locked ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{modalTargetWallet.locked ? "Unlock" : "Lock"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
