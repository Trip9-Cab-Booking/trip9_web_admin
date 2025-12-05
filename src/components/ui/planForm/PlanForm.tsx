import React, { useState } from "react";
import type { Plan, VehicleType, RideLimitPeriod } from "../../../types/types";

const ALL_VEHICLE_TYPES: VehicleType[] = ["car_economy", "car_premium", "auto", "bike"];

const VEHICLE_META: Record<VehicleType, { label: string; emoji?: string }> = {
    car_economy: { label: "Car (economy)", emoji: "🚗" },
    car_premium: { label: "Car (premium)", emoji: "🚘" },
    auto: { label: "Auto", emoji: "🛺" },
    bike: { label: "Bike", emoji: "🏍️" },
};

export default function PlanForm({
    initial,
    onCancel,
    onSave,
}: {
    initial?: Partial<Plan> & { id?: string };
    onCancel: () => void;
    onSave: (p: Partial<Plan> & { id?: string }) => void;
}) {
    const [name, setName] = useState(initial?.name ?? "");
    const [planPrice, setPlanPrice] = useState<number>(initial?.pricePerMonth ?? 0);
    const [durationMonths, setDurationMonths] = useState<number>(initial?.durationMonths ?? 1);
    const [desc, setDesc] = useState(initial?.description ?? "");
    const [isActive, setIsActive] = useState(initial?.isActive ?? true);
    const [planRideLimit, setPlanRideLimit] = useState<number | "">(
        typeof initial?.rideLimit === "number" ? initial!.rideLimit! : ""
    );
    const [planRideLimitPeriod, setPlanRideLimitPeriod] = useState<RideLimitPeriod>(
        (initial?.rideLimitPeriod as RideLimitPeriod) ?? "monthly"
    );
    const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>(initial?.vehicleTypes ?? []);
    const initialPricing = (initial as any)?.vehiclePricing ?? {};
    const [vehiclePricing, setVehiclePricing] = useState<
        Partial<Record<VehicleType, { price?: number; durationDays?: number; rideLimit?: number }>>
    >(() => {
        const out: Partial<Record<VehicleType, { price?: number; durationDays?: number; rideLimit?: number }>> = {};
        ALL_VEHICLE_TYPES.forEach((t) => {
            const e = initialPricing[t];
            if (e) {
                out[t] = {
                    ...(typeof e.price === "number" ? { price: e.price } : {}),
                    ...(typeof e.durationDays === "number" ? { durationDays: e.durationDays } : {}),
                    ...(typeof e.rideLimit === "number" ? { rideLimit: e.rideLimit } : {}),
                };
            }
        });
        return out;
    });

    const periodDays = (p: RideLimitPeriod) => (p === "daily" ? 1 : p === "weekly" ? 7 : 30);

    function toggleVehicleType(t: VehicleType) {
        setVehicleTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
    }

    function updateVehiclePricing(
        t: VehicleType,
        patch: Partial<{ price?: number | ""; durationDays?: number | ""; rideLimit?: number | "" }>
    ) {
        setVehiclePricing((prev) => {
            const cur = prev[t] ?? {};
            const next = { ...cur };
            if ("price" in patch) {
                next.price = patch.price === "" ? undefined : (patch.price as number | undefined);
            }
            if ("durationDays" in patch) {
                next.durationDays = patch.durationDays === "" ? undefined : (patch.durationDays as number | undefined);
            }
            if ("rideLimit" in patch) {
                next.rideLimit = patch.rideLimit === "" ? undefined : (patch.rideLimit as number | undefined);
            }
            return { ...prev, [t]: next };
        });
    }

    function handleSubmit(e?: React.FormEvent) {
        e?.preventDefault?.();
        const cleaned: Partial<Record<VehicleType, { price?: number; durationDays?: number; rideLimit?: number }>> = {};
        (Object.keys(vehiclePricing) as VehicleType[]).forEach((t) => {
            const entry = vehiclePricing[t];
            if (!entry) return;
            const hasPrice = typeof entry.price === "number";
            const hasDays = typeof entry.durationDays === "number";
            const hasRideLimit = typeof entry.rideLimit === "number";
            if (hasPrice || hasDays || hasRideLimit) {
                cleaned[t] = {};
                if (hasPrice) cleaned[t]!.price = entry.price!;
                if (hasDays) cleaned[t]!.durationDays = entry.durationDays!;
                if (hasRideLimit) cleaned[t]!.rideLimit = entry.rideLimit!;
            }
        });

        onSave({
            id: initial?.id,
            name,
            pricePerMonth: planPrice,
            durationMonths,
            description: desc,
            isActive,
            rideLimit: typeof planRideLimit === "number" ? planRideLimit : undefined,
            rideLimitPeriod: planRideLimitPeriod,
            vehicleTypes,
            vehiclePricing: cleaned,
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Plan basics */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Plan name</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full border rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                />
            </div>

            {/* Supported vehicle types */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Supported vehicle types</label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {ALL_VEHICLE_TYPES.map((t) => {
                        const active = vehicleTypes.includes(t);
                        return (
                            <button
                                key={t}
                                type="button"
                                onClick={() => toggleVehicleType(t)}
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors focus:outline-none
                  ${active
                                        ? "bg-indigo-50 border border-indigo-200 text-indigo-800 dark:bg-indigo-900/30 dark:border-indigo-700"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"}
                `}
                                aria-pressed={active}
                                title={VEHICLE_META[t].label}
                            >
                                <span className="text-sm">{VEHICLE_META[t].emoji}</span>
                                <span>{VEHICLE_META[t].label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div>
                
                <div className="mt-3 space-y-3">
                    {ALL_VEHICLE_TYPES.map((t) => {
                        const selected = vehicleTypes.includes(t);
                        const entry = vehiclePricing[t] ?? {};

                        return (
                            <div key={t} className="grid grid-cols-12 gap-3 items-center bg-white dark:bg-gray-800 border rounded-md p-3">
                                <div className="col-span-3 flex items-center gap-3">
                                    <div className="text-xl">{VEHICLE_META[t].emoji}</div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-gray-100">{VEHICLE_META[t].label}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {selected ? "Enabled" : "Not enabled"}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-3">
                                    <label className="text-xs text-gray-700 dark:text-gray-200 block">Price</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={typeof entry.price === "number" ? entry.price : ""}
                                        onChange={(e) => updateVehiclePricing(t, { price: e.target.value === "" ? "" : Number(e.target.value) })}
                                        disabled={!selected}
                                        className="mt-1 block w-full border rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        placeholder="e.g. 99"
                                    />
                                </div>

                                <div className="col-span-3">
                                    <label className="text-xs text-gray-700 dark:text-gray-200 block">Duration</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={typeof entry.durationDays === "number" ? entry.durationDays : ""}
                                        onChange={(e) => updateVehiclePricing(t, { durationDays: e.target.value === "" ? "" : Number(e.target.value) })}
                                        disabled={!selected}
                                        className="mt-1 block w-full border rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        placeholder="e.g. 1 (daily) or 7 (weekly)"
                                    />
                                </div>

                                <div className="col-span-3">
                                    <label className="text-xs text-gray-700 dark:text-gray-200 block">Ride limit</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={typeof entry.rideLimit === "number" ? entry.rideLimit : ""}
                                        onChange={(e) => updateVehiclePricing(t, { rideLimit: e.target.value === "" ? "" : Number(e.target.value) })}
                                        disabled={!selected}
                                        className="mt-1 block w-full border rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        placeholder={`e.g. 12 (per ${planRideLimitPeriod})`}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Description <span className="text-xs text-gray-500">(Optional)</span>
                </label>
                <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="mt-1 block w-full border rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
            </div>

            <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                    <span className="text-sm">Active</span>
                </label>
            </div>

            <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700" onClick={onCancel}>
                    Cancel
                </button>

                <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white">
                    Save
                </button>
            </div>
        </form>
    );
}
