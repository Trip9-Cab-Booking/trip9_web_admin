import React from "react";
import type { Plan, VehicleType } from "../../../types/types";
import { formatCurrency } from "../../../types/types";

type Props = {
    plan: Plan;
    onEdit: (plan: Plan) => void;
    onView?: (plan: Plan) => void;
    onDelete: (id: string) => void;
    onViewDrivers: (id: string) => void;
};

export default function PlanCard({ plan, onEdit, onDelete, onView, onViewDrivers }: Props) {
    const vehicleList = plan.vehicleTypes ?? [];
    const vp = plan.vehiclePricing ?? {};

    const priceLabel = typeof plan.pricePerMonth === "number" ? formatCurrency(plan.pricePerMonth) : "—";
    const statusLabel = plan.isActive ? "Active" : "Inactive";

    let durationLabel: string | undefined;

    if (plan.subscriptionType === "unlimited") {
        durationLabel = "Unlimited";
    } else if (typeof plan.days === "number") {
        durationLabel = `${Math.round(plan.days)}d`;
    } else if (typeof plan.durationMonths === "number") {
        durationLabel = `${plan.durationMonths} mo`;
    } else {
        durationLabel = "—";
    }


    return (
        <article className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 truncate">{plan.name}</h3>
                        <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${plan.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600 dark:bg-gray-700"
                                }`}
                            aria-hidden
                        >
                            {statusLabel}
                        </span>
                    </div>

                    {plan.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-300 mt-1 truncate">{plan.description}</p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                        {vehicleList.length ? (
                            vehicleList.map((vt) => {
                                // vt is the canonical vehicle key (e.g. "car_economy", "auto", "bike")
                                let label: string = vt;
                                if ((vt as string).startsWith("car_")) {
                                    label = `Car — ${vt.includes("economy") ? "Economy" : "Premium"}`;
                                } else if (vt === "auto") {
                                    label = "Auto";
                                } else if (vt === "bike") {
                                    label = "Bike";
                                }

                                const override = vp[vt as keyof typeof vp];
                                const smallPrice = override?.price ?? plan.pricePerMonth;
                                const durationDaysFromOverride = override?.durationDays;
                                const smallDur =
                                    durationDaysFromOverride ??
                                    (typeof plan.days === "number" ? plan.days : undefined);

                                const smallDurLabel =
                                    typeof smallDur === "number" ? `${Math.round(smallDur)}d` : undefined;

                                return (
                                    <span
                                        key={vt}
                                        className={`text-xs px-2 py-1 rounded-md border ${override ? "bg-indigo-50 border-indigo-200 text-indigo-900" : "bg-gray-50 border-gray-100 text-gray-700 dark:bg-gray-700"
                                            }`}
                                        title={`${label}`}
                                    >
                                        <div className="font-medium text-gray-500">{label}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            {smallPrice ? formatCurrency(smallPrice) : "—"}{smallDurLabel ? ` • ${smallDurLabel}` : ""}
                                        </div>
                                    </span>
                                );
                            })
                        ) : (
                            <span className="text-xs italic text-gray-500">No vehicle types configured</span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-50">{priceLabel}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{durationLabel ?? "—"}</div>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
                <button
                    type="button"
                    onClick={() => onEdit(plan)}
                    className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                    aria-label={`Edit ${plan.name}`}
                >
                    Edit
                </button>

                {onView && (
                    <button
                        type="button"
                        onClick={() => onView(plan)}
                        className="px-3 py-1 rounded-md bg-white border text-black text-sm hover:bg-gray-50"
                        aria-label={`View ${plan.name}`}
                    >
                        View
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => onDelete(plan.id)}
                    className="px-3 py-1 rounded-md bg-red-50 text-red-700 border border-red-100 text-sm hover:bg-red-100"
                    aria-label={`Delete ${plan.name}`}
                >
                    Delete
                </button>
            </div>
        </article>
    );
}
