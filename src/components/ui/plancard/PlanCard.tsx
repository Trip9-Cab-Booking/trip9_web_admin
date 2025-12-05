import React from "react";
import type { Plan, VehicleType } from "../../../types/types";
import { formatCurrency } from "../../../types/types";

const ALL_VEHICLE_TYPES: VehicleType[] = ["car_economy", "car_premium", "auto", "bike"];

const VEHICLE_META: Record<VehicleType, { label: string; emoji?: string }> = {
    car_economy: { label: "Car (economy)", emoji: "🚗" },
    car_premium: { label: "Car (premium)", emoji: "🚘" },
    auto: { label: "Auto", emoji: "🛺" },
    bike: { label: "Bike", emoji: "🏍️" },
};

function periodLabel(period?: string) {
    switch (period) {
        case "daily":
            return "day";
        case "weekly":
            return "week";
        case "monthly":
            return "month";
        case "unlimited":
            return "unlimited";
        default:
            return "period";
    }
}

export default function PlanCard({
    plan,
    onEdit,
    onDelete,
    onViewDrivers,
}: {
    plan: Plan;
    onEdit: (p: Plan) => void;
    onDelete: (id: string) => void;
    onViewDrivers: (id: string) => void;
}) {
    const supported = new Set(plan.vehicleTypes ?? []);
    const vp = plan.vehiclePricing ?? ({} as Partial<Record<VehicleType, { price?: number; durationDays?: number; rideLimit?: number }>>);

    const planRideLimit = plan.rideLimit;
    const planRidePeriod = plan.rideLimitPeriod ?? "monthly";

    return (
        <div className="border rounded-md p-4 flex flex-col gap-3 bg-white dark:bg-gray-800">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{plan.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                </div>

                {/* <div className="text-right">
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(plan.pricePerMonth)}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">/ month (fallback)</div>
                </div> */}
            </div>

            <div className="flex flex-wrap gap-2">
                {ALL_VEHICLE_TYPES.map((vt) => {
                    const isSupported = supported.has(vt);
                    const override = vp[vt];
                    const showOverride = !!override && (typeof override.price === "number" || typeof override.durationDays === "number" || typeof override.rideLimit === "number");

                    const effectivePriceLabel =
                        showOverride && typeof override?.price === "number"
                            ? formatCurrency(override!.price!)
                            : plan.pricePerMonth
                                ? formatCurrency(plan.pricePerMonth)
                                : "—";

                    const effectiveDurationLabel =
                        showOverride && typeof override?.durationDays === "number"
                            ? `${override!.durationDays}d`
                            : plan.durationMonths
                                ? `${plan.durationMonths}mo`
                                : "—";

                    const effectiveRideLimit = typeof override?.rideLimit === "number" ? override!.rideLimit! : typeof planRideLimit === "number" ? planRideLimit : null;

                    const ridePeriod = plan.rideLimitPeriod ?? "monthly";

                    const rideText =
                        ridePeriod === "unlimited"
                            ? "Unlimited"
                            : effectiveRideLimit !== null
                                ? `${effectiveRideLimit} ride${effectiveRideLimit === 1 ? "" : "s"}/${periodLabel(ridePeriod)}`
                                : "—";

                    return (
                        <div
                            key={vt}
                            className={`flex items-center gap-3 px-3 py-1 rounded-md text-sm select-none transition-colors
                ${isSupported
                                    ? "bg-indigo-50 border border-indigo-200 text-indigo-900 dark:bg-indigo-900/30 dark:border-indigo-700"
                                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                            title={`${VEHICLE_META[vt].label}${isSupported ? "" : " — not included"}`}
                        >
                            <span className="text-lg">{VEHICLE_META[vt].emoji}</span>

                            <div className="flex flex-col leading-tight">
                                <span className={`${isSupported ? "font-medium text-indigo-900 dark:text-indigo-200" : "text-gray-700 dark:text-gray-200"}`}>
                                    {VEHICLE_META[vt].label}
                                </span>

                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                    {isSupported ? (
                                        <>
                                            <span className="mr-1">
                                                <strong className="text-gray-900 dark:text-gray-100">{effectivePriceLabel}</strong>
                                                <span className="mx-1">•</span>
                                                <span>{effectiveDurationLabel}</span>
                                            </span>
                                            {/* <span className="ml-2 text-xs text-indigo-600">{showOverride ? "override" : "fallback"}</span> */}
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{rideText}</div>
                                        </>
                                    ) : (
                                        <span className="text-xs italic text-gray-500">Not included</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-2 mt-3">
                <button className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm" onClick={() => onEdit(plan)}>
                    Edit
                </button>
                <button className="px-3 py-1 rounded-md bg-red-100 text-red-700 text-sm" onClick={() => onDelete(plan.id)}>
                    Delete
                </button>
                <button className="px-3 py-1 rounded-md bg-gray-100 text-sm" onClick={() => onViewDrivers(plan.id)}>
                    View drivers
                </button>
            </div>
        </div>
    );
}
