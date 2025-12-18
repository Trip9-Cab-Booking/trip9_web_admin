"use client";

import React from "react";
import { Promo, PromoForm, PromoType } from "@/types/promo";

type Props = {
    newPromo: PromoForm;
    promos: Promo[];
    setNewPromo: React.Dispatch<React.SetStateAction<PromoForm>>;
    savePromo: () => void;
    removePromo: (code: string) => void;
};

const PromoDiscountControl: React.FC<Props> = ({
    newPromo,
    promos,
    setNewPromo,
    savePromo,
    removePromo,
}) => {

    const selectPromo = (promo: Promo) => {
        setNewPromo({
            code: promo.couponCode,
            type: promo.type,
            value: promo.value,
            validFrom: promo.validFrom.slice(0, 16),
            validTo: promo.validTo.slice(0, 16),
            maxDiscountPerRide: promo.maxDiscountPerRide,
            totalUsageLimit: promo.totalUsageLimit,
            couponId: promo.couponId,
        });
    };

    return (
        <section>
            <h3 className="text-lg font-medium mb-3">Coupon</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CREATE / EDIT PROMO */}
                <div className="p-3 border rounded">
                    <h4 className="font-medium mb-2">
                        {newPromo.code ? "Edit Coupon" : "Create Coupon"}
                    </h4>

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
                        <option value="PERCENTAGE">Percentage</option>
                        <option value="FLAT">Flat</option>
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
                        value={newPromo.validFrom || ""}
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
                        value={newPromo.validTo || ""}
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
                            onClick={savePromo}
                            className="px-3 py-2 rounded bg-indigo-600 text-white"
                        >
                            {newPromo.code ? "Update" : "Create"}
                        </button>

                        <button
                            onClick={() =>
                                setNewPromo({
                                    code: "",
                                    type: "PERCENTAGE",
                                    value: 10,
                                    validFrom: "",
                                    validTo: "",
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
                    <h4 className="font-medium mb-2">Active Coupons</h4>

                    <div className="space-y-2 max-h-64 overflow-auto">
                        {promos.length === 0 && (
                            <div className="text-sm text-gray-500">No coupons yet</div>
                        )}

                        {promos.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => selectPromo(p)}
                                className="flex items-center justify-between border p-2 rounded cursor-pointer hover:bg-gray-50"
                            >
                                <div>
                                    <div className="font-medium">{p.couponCode}</div>
                                    <div className="text-xs text-gray-500">
                                        {p.type} • {p.value}
                                        {p.type === "PERCENTAGE" ? "%" : ""}
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removePromo(p.couponId);
                                    }}
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
