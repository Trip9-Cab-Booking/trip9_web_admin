"use client";

import React from "react";
import { Promo, PromoType } from "@/types/promo";

type Props = {
    newPromo: Promo;
    promos: Promo[];
    setNewPromo: React.Dispatch<React.SetStateAction<Promo>>;
    addPromo: () => void;
    removePromo: (code: string) => void;
};

const PromoDiscountControl: React.FC<Props> = ({
    newPromo,
    promos,
    setNewPromo,
    addPromo,
    removePromo,
}) => {
    return (
        <section>
            <h3 className="text-lg font-medium mb-3">Promo & Discount Control</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CREATE PROMO */}
                <div className="p-3 border rounded">
                    <h4 className="font-medium mb-2">Create Promo</h4>

                    <label className="text-xs">Code</label>
                    <input
                        value={newPromo.code}
                        onChange={(e) =>
                            setNewPromo((p) => ({
                                ...p,
                                code: e.target.value.toUpperCase(),
                            }))
                        }
                        className="mt-1 block w-full rounded border p-2"
                    />

                    <label className="text-xs mt-2">Type</label>
                    <select
                        value={newPromo.type}
                        onChange={(e) =>
                            setNewPromo((p) => ({
                                ...p,
                                type: e.target.value as PromoType,
                            }))
                        }
                        className="block w-full mt-1 rounded border p-2"
                    >
                        <option value="percentage">Percentage</option>
                        <option value="flat">Flat</option>
                    </select>

                    <label className="text-xs mt-2">Value</label>
                    <input
                        type="number"
                        value={newPromo.value}
                        onChange={(e) =>
                            setNewPromo((p) => ({
                                ...p,
                                value: Number(e.target.value),
                            }))
                        }
                        className="mt-1 block w-full rounded border p-2"
                    />

                    <label className="text-xs mt-2">Validity from</label>
                    <input
                        type="datetime-local"
                        value={newPromo.validFrom ?? ""}
                        onChange={(e) =>
                            setNewPromo((p) => ({
                                ...p,
                                validFrom: e.target.value,
                            }))
                        }
                        className="mt-1 block w-full rounded border p-2"
                    />

                    <label className="text-xs mt-2">Validity to</label>
                    <input
                        type="datetime-local"
                        value={newPromo.validTo ?? ""}
                        onChange={(e) =>
                            setNewPromo((p) => ({
                                ...p,
                                validTo: e.target.value,
                            }))
                        }
                        className="mt-1 block w-full rounded border p-2"
                    />

                    <label className="text-xs mt-2">Max discount per ride</label>
                    <input
                        type="number"
                        value={newPromo.maxDiscountPerRide}
                        onChange={(e) =>
                            setNewPromo((p) => ({
                                ...p,
                                maxDiscountPerRide: Number(e.target.value),
                            }))
                        }
                        className="mt-1 block w-full rounded border p-2"
                    />

                    <label className="text-xs mt-2">Total usage limit</label>
                    <input
                        type="number"
                        value={newPromo.totalUsageLimit}
                        onChange={(e) =>
                            setNewPromo((p) => ({
                                ...p,
                                totalUsageLimit: Number(e.target.value),
                            }))
                        }
                        className="mt-1 block w-full rounded border p-2"
                    />

                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={addPromo}
                            className="px-3 py-2 rounded bg-indigo-600 text-white"
                        >
                            Create
                        </button>
                        <button
                            onClick={() =>
                                setNewPromo({
                                    code: "",
                                    type: "percentage",
                                    value: 10,
                                    validFrom: undefined,
                                    validTo: undefined,
                                    maxDiscountPerRide: 100,
                                    totalUsageLimit: 1000,
                                })
                            }
                            className="px-3 py-2 rounded bg-gray-200"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* ACTIVE PROMOS */}
                <div className="p-3 border rounded">
                    <h4 className="font-medium mb-2">Active Promos</h4>

                    <div className="space-y-2 max-h-64 overflow-auto">
                        {promos.length === 0 && (
                            <div className="text-sm text-gray-500">No promos yet</div>
                        )}

                        {promos.map((p) => (
                            <div
                                key={p.code}
                                className="flex items-center justify-between border p-2 rounded"
                            >
                                <div>
                                    <div className="font-medium">{p.code}</div>
                                    <div className="text-xs text-gray-500">
                                        {p.type} • {p.value}
                                        {p.type === "percentage" ? "%" : ""}
                                    </div>
                                </div>
                                <button
                                    onClick={() => removePromo(p.code)}
                                    className="px-2 py-1 rounded bg-red-500 text-white text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PromoDiscountControl;
