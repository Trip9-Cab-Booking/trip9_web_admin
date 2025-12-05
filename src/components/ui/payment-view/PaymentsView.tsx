import React, { useState } from "react";
import type { Driver, Payment, Plan } from "../../../types/types";
import { formatCurrency } from "../../../types/types";

export default function PaymentsView({
    driver,
    payments,
    plans,
    onAdd,
}: {
    driver: Driver;
    payments: Payment[];
    plans: Plan[];
    onAdd: (payload: { driverId: string; amount: number; planId?: string | null }) => void;
}) {
    const [amount, setAmount] = useState<number>(0);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(plans[0]?.id ?? null);

    return (
        <div>
            <div className="mb-4">
                <div className="text-sm text-gray-500">Driver</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{driver.name}</div>
            </div>

            <div className="mb-4">
                <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Payment history</h4>
                <div className="space-y-2 max-h-64 overflow-auto">
                    {payments.length === 0 && <div className="text-sm text-gray-500 dark:text-gray-400">No payments yet</div>}
                    {payments.map((p) => (
                        <div key={p.id} className="flex justify-between items-center border rounded p-2 bg-white dark:bg-gray-800">
                            <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(p.amount)}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(p.date).toLocaleString()}</div>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{plans.find((pl) => pl.id === p.planId)?.name ?? "Manual"}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Amount</label>
                    <input type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} className="mt-1 block w-full border rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Plan (optional)</label>
                    <select value={selectedPlanId ?? ""} onChange={(e) => setSelectedPlanId(e.target.value || null)} className="mt-1 block w-full border rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                        <option value="">Manual / one-off</option>
                        {plans.map((pl) => (
                            <option key={pl.id} value={pl.id}>
                                {pl.name} — {formatCurrency(pl.pricePerMonth)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-2">
                    <button className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700" onClick={() => { setAmount(0); setSelectedPlanId(plans[0]?.id ?? null); }}>
                        Reset
                    </button>
                    <button
                        className="px-3 py-1 rounded-md bg-indigo-600 text-white"
                        onClick={() => {
                            if (amount <= 0) return alert("Enter a valid amount");
                            onAdd({ driverId: driver.id, amount, planId: selectedPlanId });
                            setAmount(0);
                        }}
                    >
                        Add payment
                    </button>
                </div>
            </div>
        </div>
    );
}
