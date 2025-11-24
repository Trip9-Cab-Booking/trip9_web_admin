"use client";

import React, { useMemo, useState } from "react";

type Role = "user" | "driver";

type Wallet = {
  id: string;
  name: string;
  role: Role;
  phone?: string;
  email?: string;
  balance: number;
  locked: boolean;
};

type Transaction = {
  id: string;
  walletId: string;
  type: "credit" | "debit";
  amount: number;
  date: string; // ISO
  note?: string;
};

const MOCK_WALLETS: Wallet[] = [
  { id: "w_u_1", name: "Ranjima Ghosh", role: "user", email: "ranjima@example.com", phone: "+91 90000 00001", balance: 1540.5, locked: false },
  { id: "w_u_2", name: "Amit Roy", role: "user", email: "amit@example.com", phone: "+91 90000 00002", balance: 0, locked: true },
  { id: "w_d_1", name: "Driver - S. Banerjee", role: "driver", phone: "+91 90000 00011", balance: 8420, locked: false },
  { id: "w_d_2", name: "Driver - K. Sen", role: "driver", phone: "+91 90000 00012", balance: 120.75, locked: false }
];

const MOCK_TXNS: Transaction[] = [
  { id: "t1", walletId: "w_u_1", type: "credit", amount: 500, date: "2025-11-20T09:15:00.000Z", note: "Top-up via UPI" },
  { id: "t2", walletId: "w_u_1", type: "debit", amount: 120.5, date: "2025-11-21T12:00:00.000Z", note: "Ride payment #R1002" },
  { id: "t3", walletId: "w_d_1", type: "credit", amount: 3000, date: "2025-11-19T08:30:00.000Z", note: "Payout" },
  { id: "t4", walletId: "w_d_2", type: "debit", amount: 50, date: "2025-11-22T14:45:00.000Z", note: "Adjustment" }
];

export default function WalletManagement() {
  const [activeRole, setActiveRole] = useState<Role>("user");
  const [query, setQuery] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(MOCK_WALLETS[0].id);
  const [wallets, setWallets] = useState<Wallet[]>(MOCK_WALLETS);
  const [txns] = useState<Transaction[]>(MOCK_TXNS);
  const [showLockModal, setShowLockModal] = useState(false);
  const [modalTargetWallet, setModalTargetWallet] = useState<Wallet | null>(null);

  const filtered = useMemo(() => wallets.filter(w => w.role === activeRole && (w.name.toLowerCase().includes(query.toLowerCase()) || (w.phone || "").includes(query) || (w.email || "").includes(query))), [wallets, activeRole, query]);

  const selectedWallet = useMemo(() => wallets.find(w => w.id === selectedWalletId) ?? filtered[0] ?? null, [wallets, selectedWalletId, filtered]);

  const walletTxns = useMemo(() => { if (!selectedWallet) return []; return txns.filter(t => t.walletId === selectedWallet.id).sort((a,b)=> +new Date(b.date) - +new Date(a.date)); }, [txns, selectedWallet]);

  function openLockModal(w: Wallet) {
    setModalTargetWallet(w);
    setShowLockModal(true);
  }

  function toggleLockWallet(w: Wallet) {
    setWallets(prev => prev.map(p => p.id === w.id ? { ...p, locked: !p.locked } : p));
    setShowLockModal(false);
    setModalTargetWallet(null);
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 text-gray-900">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Wallet Management</h1>
            <p className="text-sm text-gray-600">Manage wallets for users and drivers — view balances, transactions and lock suspicious wallets.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left column: tabs + list */}
          <aside className="md:col-span-1 bg-white rounded-lg shadow p-4">
            <div className="flex gap-2 mb-4">
              <button onClick={() => setActiveRole("user")} className={`flex-1 py-2 rounded-md text-sm font-medium ${activeRole === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"}`}>Users</button>
              <button onClick={() => setActiveRole("driver")} className={`flex-1 py-2 rounded-md text-sm font-medium ${activeRole === "driver" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"}`}>Drivers</button>
            </div>

            <div className="relative mb-3">
              <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder={`Search by name / phone / email`} className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              {query && <button onClick={()=>setQuery("")} className="absolute right-2 top-2 text-xs text-gray-500">Clear</button>}
            </div>

            <div className="space-y-2 max-h-[56vh] overflow-auto pr-2">
              {filtered.length === 0 && <div className="text-sm text-gray-500">No {activeRole}s found.</div>}
              {filtered.map(w => (
                <div key={w.id} onClick={()=>setSelectedWalletId(w.id)} className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${selectedWalletId === w.id ? "bg-indigo-50 border border-indigo-100" : "hover:bg-gray-50"}`}>
                  <div>
                    <div className="text-sm font-medium">{w.name}</div>
                    <div className="text-xs text-gray-500">{w.phone ?? w.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">₹{w.balance.toFixed(2)}</div>
                    <div className={`text-xs mt-1 ${w.locked ? "text-red-600" : "text-green-600"}`}>{w.locked ? "Locked" : "Active"}</div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Right column: details and transactions */}
          <main className="md:col-span-3 space-y-6">
            <section className="bg-white rounded-lg shadow p-4">
              {!selectedWallet ? (
                <div className="text-sm text-gray-500">Select a wallet from the left to view details.</div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full w-12 h-12 bg-indigo-100 grid place-items-center font-bold text-indigo-700">{selectedWallet.name.split(" ").map(s=>s[0]).slice(0,2).join("")}</div>
                    <div>
                      <div className="text-lg font-semibold">{selectedWallet.name}</div>
                      <div className="text-sm text-gray-500">{selectedWallet.role === "user" ? "User" : "Driver"} • {selectedWallet.phone ?? selectedWallet.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Wallet balance</div>
                      <div className="text-2xl font-bold">₹{selectedWallet.balance.toFixed(2)}</div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => openLockModal(selectedWallet)} className={`px-4 py-2 rounded-md border ${selectedWallet.locked ? "bg-yellow-50 border-yellow-300" : "bg-red-600 text-white border-red-600"}`}>
                        {selectedWallet.locked ? "Unlock wallet" : "Lock wallet"}
                      </button>

                      <button onClick={() => alert("Open wallet top-up / payout flow (not implemented) ")} className="px-4 py-2 rounded-md border bg-gray-100 text-gray-700">Actions</button>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">Transaction history</h3>
                <div className="text-sm text-gray-500">{selectedWallet ? `Showing recent transactions for ${selectedWallet.name}` : "Select a wallet to see transactions"}</div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b">
                      <th className="py-2">Date</th>
                      <th className="py-2">Transaction ID</th>
                      <th className="py-2">Type</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedWallet && walletTxns.length === 0 && (
                      <tr><td colSpan={5} className="py-6 text-center text-gray-500">No transactions found</td></tr>
                    )}

                    {selectedWallet && walletTxns.map(t => (
                      <tr key={t.id} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-3">{new Date(t.date).toLocaleString()}</td>
                        <td className="py-3">{t.id}</td>
                        <td className="py-3 capitalize">{t.type}</td>
                        <td className={`py-3 font-medium ${t.type === "credit" ? "text-green-600" : "text-red-600"}`}>₹{t.amount.toFixed(2)}</td>
                        <td className="py-3 text-gray-600">{t.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-right text-xs text-gray-500">Showing {walletTxns.length} transactions</div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Total wallets (current tab)</div>
                <div className="text-xl font-bold mt-2">{filtered.length}</div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Total balance (current tab)</div>
                <div className="text-xl font-bold mt-2">₹{filtered.reduce((s, w) => s + w.balance, 0).toFixed(2)}</div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Locked wallets</div>
                <div className="text-xl font-bold mt-2">{filtered.filter(w=>w.locked).length}</div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Lock / Unlock confirmation modal */}
      {showLockModal && modalTargetWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md bg-white rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-2">{modalTargetWallet.locked ? "Unlock wallet" : "Lock wallet"}</h4>
            <p className="text-sm text-gray-600 mb-4">{modalTargetWallet.locked ? "Are you sure you want to unlock this wallet? Unlocking will allow transactions again." : "Locking a wallet will prevent any outgoing transactions — use this for fraud or suspicious cases. This will not delete the wallet."}</p>

            <div className="flex items-center justify-end gap-2">
              <button onClick={() => { setShowLockModal(false); setModalTargetWallet(null); }} className="px-3 py-2 rounded-md border bg-gray-100 text-gray-700">Cancel</button>
              <button onClick={() => toggleLockWallet(modalTargetWallet)} className={`px-3 py-2 rounded-md ${modalTargetWallet.locked ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{modalTargetWallet.locked ? "Unlock" : "Lock"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
