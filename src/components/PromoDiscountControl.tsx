"use client";

import React, { useEffect, useState } from "react";
import { Promo, PromoForm, PromoType } from "@/types/promo";
import { Trash2 } from "lucide-react";
import DeleteConfirmModal from "./DeleteConfirmModal";
import Pagination from "./ui/pagination";
import { axiosInstance } from "@/utils/axiosInstance";

type Props = {
    newPromo: PromoForm;
    // promos: Promo[];
    setNewPromo: React.Dispatch<React.SetStateAction<PromoForm>>;
    savePromo: () => void;
    removePromo: (code: string) => void;
    onRefresh: () => void;
};

const PromoDiscountControl: React.FC<Props> = ({
    newPromo,
    // promos,
    setNewPromo,
    savePromo,
    removePromo,
    onRefresh
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
    const [promos, setPromos] = React.useState<Promo[]>([]);
    const [page, setPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const [loadingPromos, setLoadingPromos] = React.useState(false);
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [selectedCouponId, setSelectedCouponId] = React.useState<string | null>(null);
    const [deleting, setDeleting] = React.useState(false);

    const handleRefresh = () => {
        setPage(1);
    };


    const fetchCoupons = async (page = 1, limit = 10) => {
        const response = await axiosInstance.get(
            "/api/admin/coupon/coupons",
            { params: { page, limit } }
        );

        setPromos(response.data.data.list);
        setTotalPages(response.data.data.pagination.totalPages);
    };

    useEffect(() => {
        const loadCoupons = async () => {
            try {
                setLoadingPromos(true);
                await fetchCoupons(page);
            } catch (error) {
                console.error("Failed to fetch coupons", error);
            } finally {
                setLoadingPromos(false);
            }
        };

        loadCoupons();
    }, [page]);

    const handleConfirmDelete = async () => {
        if (!selectedCouponId) return;

        setDeleting(true);
        try {
            await removePromo(selectedCouponId);
            onRefresh();
        } finally {
            setDeleting(false);
            setSelectedCouponId(null);
        }
    };

    const handlePageChange = (p: number) => {
        if (p < 1 || p > totalPages) return;
        setPage(p);
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
                        max="9999-12-31T23:59"
                        value={newPromo.validFrom || ""}
                        onChange={(e) =>
                            setNewPromo((p) => ({
                                ...p,
                                validFrom: e.target.value,
                            }))
                        }
                        className="mt-1 block w-full rounded border p-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 dark:accent-white dark:scheme-dark"
                    />

                    <label className="text-xs mt-2">Validity to</label>
                    <input
                        type="datetime-local"
                        max="9999-12-31T23:59"
                        value={newPromo.validTo || ""}
                        onChange={(e) =>
                            setNewPromo((p) => ({
                                ...p,
                                validTo: e.target.value,
                            }))
                        }
                        className="mt-1 block w-full rounded border p-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 dark:accent-white dark:scheme-dark"
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
                            className="px-3 py-2 rounded bg-red-500 text-white"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* ACTIVE PROMOS */}
                <div className="p-3 border rounded flex flex-col">
                    <h4 className="font-medium mb-2">Active Coupons</h4>

                    <div className="space-y-2 max-h-fit overflow-auto">
                        {loadingPromos && (
                            <div className="text-sm text-gray-500">Loading coupons...</div>
                        )}

                        {!loadingPromos && promos.length === 0 && (
                            <div className="text-sm text-gray-500">No coupons yet</div>
                        )}

                        {promos.map((p) => (
                            <div
                                key={p.id}
                                onClick={() => selectPromo(p)}
                                className="flex items-center justify-between border p-2 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
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
                                        setSelectedCouponId(p.couponId);
                                        setDeleteOpen(true);
                                    }}
                                >
                                    <Trash2 className="w-5 h-5 text-red-500" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* ✅ Pagination INSIDE promo */}
                    {totalPages > 1 && (
                        <div className="mt-3 self-end">
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>

            </div>
            <DeleteConfirmModal open={deleteOpen}
                onOpenChange={setDeleteOpen}
                onConfirm={handleConfirmDelete}
                loading={deleting}
                title="Delete promo code?"
                description="This promo code will be permanently removed. This action cannot be undone."
                destructiveLabel="Delete"
                cancelLabel="Cancel" />
        </section>
    );
};

export default PromoDiscountControl;
