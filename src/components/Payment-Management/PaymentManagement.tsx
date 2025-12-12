"use client";

import React, { useEffect, useMemo, useState } from "react";
import CompactFilters from "../ui/filters";
import { axiosInstance } from "@/utils/axiosInstance";
import Pagination from "../ui/pagination";

export type Transaction = {
  id: string;
  type: "ride" | "driver_subscription" | "penalty" | "refund" | "adjustment";
  userName: string;
  driverName?: string;
  amount: number;
  currency?: string;
  mode: "card" | "netbanking" | "upi" | "cash" | "wallet";
  status: "success" | "failed" | "pending";
  date: string;
  tdr?: number;
};

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "TXN001",
    type: "ride",
    userName: "Asha Kumar",
    driverName: "Rohit Das",
    amount: 420.5,
    currency: "INR",
    mode: "card",
    status: "success",
    date: "2025-11-22T10:12:00.000Z",
    tdr: 12.63,
  },
  {
    id: "TXN002",
    type: "driver_subscription",
    userName: "Driver: Suresh",
    amount: 999,
    currency: "INR",
    mode: "upi",
    status: "success",
    date: "2025-11-23T14:30:00.000Z",
    tdr: 0,
  },
  {
    id: "TXN003",
    type: "penalty",
    userName: "Asha Kumar",
    driverName: "Rohit Das",
    amount: 100,
    currency: "INR",
    mode: "card",
    status: "failed",
    date: "2025-11-20T08:00:00.000Z",
    tdr: 3,
  },
  {
    id: "TXN004",
    type: "refund",
    userName: "Manish Roy",
    amount: -150,
    currency: "INR",
    mode: "card",
    status: "success",
    date: "2025-11-21T09:40:00.000Z",
    tdr: 0,
  },
  {
    id: "TXN005",
    type: "ride",
    userName: "Priya Sen",
    driverName: "Ankit Paul",
    amount: 230,
    currency: "INR",
    mode: "wallet",
    status: "pending",
    date: "2025-11-23T18:05:00.000Z",
    tdr: 6.9,
  },
];

const currencyFmt = (v: number, cur = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: cur }).format(v);



export default function PaymentManagementPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [txLimit, setTxLimit] = useState(5);
  const [txTotal, setTxTotal] = useState(0);
  const [txTotalPages, setTxTotalPages] = useState(1);

  // Filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState<string | "">("");
  const [selectedStatus, setSelectedStatus] = useState<string | "">("");
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const toggleType = (t: string) => {
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (selectedTypes.length && !selectedTypes.includes(tx.type)) return false;
      if (selectedMode && tx.mode !== selectedMode) return false;
      if (selectedStatus && tx.status !== selectedStatus) return false;
      if (q) {
        const s = q.toLowerCase();
        if (!(`${tx.userName} ${tx.driverName ?? ""} ${tx.id}`.toLowerCase().includes(s))) return false;
      }
      if (dateFrom && new Date(tx.date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(tx.date) > new Date(dateTo)) return false;
      return true;
    });
  }, [transactions, selectedTypes, selectedMode, selectedStatus, q, dateFrom, dateTo]);

  function mapApiRowToTransaction(row: any): Transaction {
    const driver = row.driver ?? {};
    const user = row.user ?? {};

    const driverName =
      (driver.firstName || driver.lastName)
        ? `${(driver.firstName ?? "").trim()} ${(driver.lastName ?? "").trim()}`.trim()
        : undefined;

    const userName =
      (user.firstName || user.lastName)
        ? `${(user.firstName ?? "").trim()} ${(user.lastName ?? "").trim()}`.trim()
        : row.customerName ?? row.userName ?? undefined;

    let uiType: Transaction["type"] = "ride";
    switch (row.transactionType) {
      case "subscription":
        uiType = "driver_subscription";
        break;
      case "penalty":
        uiType = "penalty";
        break;
      case "refund":
        uiType = "refund";
        break;
      case "adjustment":
        uiType = "adjustment";
        break;
      case "topup":
        uiType = "adjustment";
        break;
      default:
        uiType = "ride";
    }

    // map mode/paymenMode -> your mode union (fallback to 'card' if unknown)
    const mode = (row.paymentMode ?? row.mode ?? "card").toString().toLowerCase() as Transaction["mode"];
    const acceptedModes: Transaction["mode"][] = ["card", "netbanking", "upi", "cash", "wallet"];
    const uiMode = acceptedModes.includes(mode as any) ? (mode as Transaction["mode"]) : "card";

    // status
    const status = (row.status ?? "pending").toString().toLowerCase() as Transaction["status"];
    const uiStatus: Transaction["status"] = status === "success" ? "success" : status === "failed" ? "failed" : "pending";




    return {
      id: row.transactionId ?? `tx_${Math.random().toString(36).slice(2, 9)}`,
      type: row.transactionType ?? uiType,
      userName: userName ?? "Unknown User",
      driverName: driverName ?? "Unknown Driver",
      amount: typeof row.totalAmount === "number" ? row.totalAmount : Number(row.totalAmount ?? 0),
      currency: "INR",
      mode: uiMode,
      status: uiStatus,
      date: row.createdAt ?? row.date ?? new Date().toISOString(),
    };
  }

  async function fetchTransactions(page = txPage, limit = txLimit) {
    setTxLoading(true);
    try {
      const res = await axiosInstance.get("/api/admin/getAlltransactions", {
        params: { page, limit },
      });

      const payload = res?.data ?? {};
      const rows = payload.data ?? payload.items ?? [];

      const mapped: Transaction[] = (rows || []).map(mapApiRowToTransaction);

      setTransactions(mapped);
      setTxPage(payload.page ?? page);
      setTxLimit(payload.limit ?? limit);
      setTxTotal(payload.total ?? mapped.length);
      setTxTotalPages(payload.totalPages ?? Math.max(1, Math.ceil((payload.total ?? mapped.length) / (payload.limit ?? limit))));
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setTxLoading(false);
    }
  }

  useEffect(() => {
    fetchTransactions(txPage, txLimit);
  }, [txPage, txLimit]);

  // const settlementSummary = useMemo(() => {
  //   const received = filtered
  //     .filter((t) => t.type === "ride" && t.status === "success")
  //     .reduce((s, t) => s + t.amount, 0);

  //   const fees = filtered.reduce((s, t) => s + (t.tdr ?? 0), 0);

  //   const byMode = filtered.reduce<Record<string, number>>((acc, t) => {
  //     acc[t.mode] = (acc[t.mode] || 0) + t.amount;
  //     return acc;
  //   }, {});

  //   return { received, fees, byMode };
  // }, [filtered]);

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Payment Management</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm">Export CSV</button>
          </div>
        </div>

        {/* Compact Filters inserted here */}
        <CompactFilters
          q={q}
          setQ={setQ}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          selectedMode={selectedMode}
          setSelectedMode={setSelectedMode}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedTypes={selectedTypes}
          toggleType={toggleType}
          onClear={() => {
            setSelectedMode("");
            setSelectedStatus("");
            setSelectedTypes([]);
            setQ("");
            setDateFrom("");
            setDateTo("");
          }}
        />

        {/* Transactions table */}
        <section className="mb-6">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Transactions ({txTotal})</h2>
              <div className="text-sm text-gray-500">
                Showing page {txPage} of {txTotalPages}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm table-auto border-collapse">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase">
                    <th className="text-left py-2 pr-4">Txn ID</th>
                    <th className="text-left py-2 pr-4">Type</th>
                    <th className="text-left py-2 pr-4">User</th>
                    <th className="text-left py-2 pr-4">Driver</th>
                    <th className="text-left py-2 pr-4">Amount</th>
                    <th className="text-left py-2 pr-4">Mode</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-left py-2 pr-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx) => (
                    <tr key={tx.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="py-3 pr-4 font-mono text-xs">{tx.id}</td>
                      <td className="py-3 pr-4 capitalize text-sm">{tx.type.replaceAll("_", " ")}</td>
                      <td className="py-3 pr-4 truncate max-w-[200px]">{tx.userName}</td>
                      <td className="py-3 pr-4 truncate max-w-[150px]">{tx.driverName ?? "—"}</td>
                      <td className="py-3 pr-4 text-left font-semibold">{currencyFmt(tx.amount)}</td>
                      <td className="py-3 pr-4 uppercase text-xs">{tx.mode}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tx.status === 'success' ? 'bg-green-100 text-green-800' : tx.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-xs text-gray-500">{new Date(tx.date).toLocaleString()}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-gray-500">No transactions match the filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="flex justify-center mt-4">
                <Pagination
                  currentPage={txPage}
                  totalPages={txTotalPages}
                  onPageChange={(page) => setTxPage(page)}
                  pageSize={txLimit}
                  pageSizeOptions={[10, 25, 50]}
                  onPageSizeChange={(size) => {
                    setTxLimit(size);
                    setTxPage(1);
                  }}
                />
              </div>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
