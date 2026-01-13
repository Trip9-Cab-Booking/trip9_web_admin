"use client";

import React, { useEffect, useState } from "react";
import { axiosInstance } from "@/utils/axiosInstance";

type VehicleCategory =
    | "all"
    | "bike"
    | "auto"
    | "car_economy"
    | "car_premium";

type FarePreviewState = {
    isGlobalPriceModel: boolean;
    category: VehicleCategory;
    distanceKm: number;
    durationMin: number;
    applyPromoCode: string;
};

type EstimatedFare = {
    baseCalc: number;
    discount: number;
    final: number;
};

const FarePreview: React.FC = () => {
    const [preview, setPreview] = useState<FarePreviewState>({
        isGlobalPriceModel: true,
        category: "all",
        distanceKm: 0,
        durationMin: 0,
        applyPromoCode: "",
    });

    const [estimatedFare, setEstimatedFare] = useState<EstimatedFare>({
        baseCalc: 0,
        discount: 0,
        final: 0,
    });

    const [loading, setLoading] = useState(false);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);


    function mapCategory(category: VehicleCategory) {
        // ✅ GLOBAL
        if (category === "all") {
            return {
                isGlobalPriceModel: true,
                vehicleType: "all",
            };
        }

        // ✅ CATEGORY
        if (category === "bike" || category === "auto") {
            return {
                isGlobalPriceModel: false,
                vehicleType: category,
            };
        }

        // ✅ CAR CATEGORY
        return {
            isGlobalPriceModel: false,
            vehicleType: "car",
            vehicleCategory:
                category === "car_economy" ? "economy" : "premium",
        };
    }


    async function fetchFarePreview() {
        try {
            setLoading(true);
            setErrorMessage(null);

            const categoryPayload = mapCategory(preview.category);

            const payload = {
                ...categoryPayload,
                distance: preview.distanceKm,
                duration: preview.durationMin,
                promoCode: preview.applyPromoCode || null,
            };

            const { data } = await axiosInstance.post(
                "/api/admin/pricing/farePreview",
                payload
            );

            if (!data.success || !data.data) {
                throw new Error(data.message || "Fare calculation failed");
            }

            const fareData = data.data;

            setEstimatedFare({
                baseCalc: fareData.calculatedFare,
                discount: fareData.discount,
                final: fareData.finalFare,
            });
        } catch (error: any) {
            const apiMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Unable to calculate fare";

            setErrorMessage(apiMessage);

            setEstimatedFare({
                baseCalc: 0,
                discount: 0,
                final: 0,
            });
        } finally {
            setLoading(false);
        }
    }



    useEffect(() => {
        if (preview.distanceKm > 0 && preview.durationMin > 0) {
            fetchFarePreview();
        }
    }, [
        preview.category,
        preview.distanceKm,
        preview.durationMin,
        preview.applyPromoCode,
    ]);

    return (
        <aside className="md:col-span-1 bg-white rounded-lg shadow p-6 dark:bg-gray-800">
            <h4 className="font-medium mb-2">Fare Preview</h4>

            <div className="space-y-2">
                <label className="text-xs">Category</label>
                <select
                    value={preview.category}
                    onChange={(e) =>
                        setPreview((p) => ({
                            ...p,
                            category: e.target.value as VehicleCategory,
                        }))
                    }
                    className="w-full rounded border p-2 dark:bg-gray-800"
                >
                    <option value="all">All</option>
                    <option value="bike">Bike</option>
                    <option value="auto">Auto</option>
                    <option value="car_economy">Car - Economic</option>
                    <option value="car_premium">Car - Premium</option>
                </select>

                <label className="text-xs">Distance (km)</label>
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={preview.distanceKm === 0 ? "" : preview.distanceKm}
                    onChange={(e) => {
                        const value = e.target.value;

                        // allow only digits & max 4 characters
                        if (!/^\d*$/.test(value) || value.length > 4) return;

                        setPreview((p) => ({
                            ...p,
                            distanceKm: value === "" ? 0 : Number(value),
                        }));
                    }}
                    className="w-full rounded border p-2"
                />


                <label className="text-xs">Duration (min)</label>
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={preview.durationMin === 0 ? "" : preview.durationMin}
                    onChange={(e) => {
                        const value = e.target.value;

                        if (!/^\d*$/.test(value) || value.length > 4) return;

                        setPreview((p) => ({
                            ...p,
                            durationMin: value === "" ? 0 : Number(value),
                        }));
                    }}
                    className="w-full rounded border p-2"
                />

                <label className="text-xs">Apply promo code</label>
                <input
                    value={preview.applyPromoCode}
                    onChange={(e) =>
                        setPreview((p) => ({
                            ...p,
                            applyPromoCode: e.target.value,
                        }))
                    }
                    className="w-full rounded border p-2"
                />

                {errorMessage && (
                    <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {errorMessage}
                    </div>
                )}


                {!errorMessage && (
                    <div className="mt-3 border-t pt-3">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-white">
                            <span>Calculated fare</span>
                            <span>{loading ? "…" : `₹${estimatedFare.baseCalc}`}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-white">
                            <span>Discount</span>
                            <span>{loading ? "…" : `-₹${estimatedFare.discount}`}</span>
                        </div>
                        <div className="flex justify-between font-medium text-lg mt-2 ">
                            <span>Final fare</span>
                            <span>{loading ? "…" : `₹${estimatedFare.final}`}</span>
                        </div>
                    </div>
                )}

            </div>
        </aside>
    );
};

export default FarePreview;
