"use client";

import React, { useEffect, useRef, useState } from "react";

export type SubscriptionType = "daily" | "weekly" | "monthly" | "yearly" | "unlimited";
export type VehicleType = "bike" | "auto" | "car";
export type Category = "premium" | "economy";

export type PlanPayload = {
    planName: string;
    subscriptionType: SubscriptionType;
    isUnlimited: boolean;
    days?: number;
    price: number;
    vehicleType?: VehicleType;
    category?: Category;
    rideLimit?: number;
    description?: string;
};

type Props = {
    open: boolean;
    initial?: Partial<PlanPayload> | null;
    onClose: () => void;
    onSave: (payload: PlanPayload) => Promise<void> | void;
};

export default function PlanForm({ open, initial = null, onClose, onSave }: Props) {
    const [planName, setPlanName] = useState(initial?.planName ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>(initial?.subscriptionType ?? "daily");
    const [isUnlimited, setIsUnlimited] = useState<boolean>(!!initial?.isUnlimited);
    const [days, setDays] = useState<number | "">(() => (typeof initial?.days === "number" ? initial!.days! : ""));
    const [price, setPrice] = useState<number | "">(() => (typeof initial?.price === "number" ? initial!.price! : ""));
    const [vehicleType, setVehicleType] = useState<VehicleType | "">(() => (initial?.vehicleType ?? ""));
    const [category, setCategory] = useState<Category | "">(() => (initial?.category ?? ""));
    const [rideLimit, setRideLimit] = useState<number | "">(() => (typeof initial?.rideLimit === "number" ? initial!.rideLimit! : ""));

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const titleRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setIsUnlimited(subscriptionType === "unlimited");
        if (subscriptionType === "unlimited") {
            setVehicleType("");
            setCategory("");
        }
    }, [subscriptionType]);

    useEffect(() => {
        if (!open) return;
        setPlanName(initial?.planName ?? "");
        setDescription(initial?.description ?? "");
        setSubscriptionType(initial?.subscriptionType ?? "daily");
        setIsUnlimited(!!initial?.isUnlimited);
        setDays(typeof initial?.days === "number" ? Math.round(initial!.days!) : "");
        setPrice(typeof initial?.price === "number" ? initial!.price! : "");
        setVehicleType((initial?.vehicleType as VehicleType) ?? "");
        setCategory((initial?.category as Category) ?? "");
        setRideLimit(typeof initial?.rideLimit === "number" ? initial!.rideLimit! : "");
        setErrors({});
        setSaving(false);
        setTimeout(() => titleRef.current?.focus(), 40);
    }, [open, initial]);

    if (!open) return null;


    function validate(): boolean {
        const e: Record<string, string> = {};
        if (!planName.trim()) e.planName = "Plan name is required.";
        if (price === "" || isNaN(Number(price)) || Number(price) < 0) e.price = "Price must be a non-negative number.";

        // rideLimit required only for non-unlimited plans
        if (!isUnlimited) {
            if (rideLimit === "" || isNaN(Number(rideLimit)) || Number(rideLimit) < 0) {
                e.rideLimit = "Ride limit is required and must be ≥ 0.";
            }
        } else {
            // unlimited plans: rideLimit is optional
            if (rideLimit !== "" && (isNaN(Number(rideLimit)) || Number(rideLimit) < 0)) {
                e.rideLimit = "Ride limit must be ≥ 0.";
            }
        }

        if (!isUnlimited) {
            if (days === "" || isNaN(Number(days)) || Number(days) <= 0) e.days = "Days must be > 0 for non-unlimited plans.";
            if (!vehicleType) e.vehicleType = "Vehicle type is required for non-unlimited plans.";
            if (vehicleType === "car" && !category) e.category = "Category is required for car.";
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    }


    async function handleSubmit(e?: React.FormEvent) {
        e?.preventDefault();
        if (!validate()) return;
        setSaving(true);

        const payload: PlanPayload = {
            planName: planName.trim(),
            description: description.trim() || undefined,
            subscriptionType,
            isUnlimited: !!isUnlimited,
            price: Number(price),
            ...(days !== "" ? { days: Number(days) } : {}),
            ...(isUnlimited ? {} : { vehicleType: vehicleType as VehicleType }),
            ...(vehicleType === "car" ? { category: category as Category } : {}),
            ...(rideLimit === "" ? {} : { rideLimit: Number(rideLimit) }),
        };

        try {
            await Promise.resolve(onSave(payload));
            onClose();
        } catch (err) {
            setErrors({ form: (err as any)?.message ?? "Failed to save plan" });
        } finally {
            setSaving(false);
        }
    }

    const Err = ({ field }: { field: string }) => (errors[field] ? <p className="text-xs text-red-600 mt-1" role="alert">{errors[field]}</p> : null);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-form-title"
        >
            <div className="absolute inset-0 bg-black/40" onClick={() => onClose()} />

            <div className="relative z-10 w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* HEADER  */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 id="plan-form-title" className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                                {initial ? "Edit Plan" : "Create Plan"}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {initial ? "Update the subscription details and pricing." : "Create a new subscription plan."}
                            </p>
                        </div>
                    </div>

                    {errors.form && (
                        <div className="text-sm text-red-600" role="alert">
                            {errors.form}
                        </div>
                    )}

                    {/* PLAN NAME */}
                    <div>
                        <label className="block">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Plan name <span className="text-red-600">*</span>
                                </span>
                            </div>

                            <input
                                ref={titleRef}
                                aria-required="true"
                                value={planName}
                                onChange={(e) => setPlanName(e.target.value)}
                                className="mt-1 block w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                                placeholder="e.g. Weekly — Economy"
                            />
                            <Err field="planName" />
                        </label>
                    </div>

                    {/* SUBSCRIPTION TYPE + DAYS + PRICE */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                        {/* Subscription type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Subscription type
                            </label>
                            <select
                                value={subscriptionType}
                                onChange={(e) => setSubscriptionType(e.target.value as SubscriptionType)}
                                disabled={!!initial}
                                className={`mt-1 block w-full border rounded-md px-3 py-2
        ${initial ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white dark:bg-gray-800"}
    `}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                                <option value="unlimited">Unlimited</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Days</label>
                            <input
                                type="number"
                                min={1}
                                value={days === "" ? "" : String(Math.round(days as number))}
                                onChange={(e) => setDays(e.target.value === "" ? "" : Number(e.target.value))}
                                disabled={!!initial && subscriptionType !== "unlimited"}
                                className={`mt-1 block w-full border rounded-md px-3 py-2
            ${initial && subscriptionType !== "unlimited"
                                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                        : "bg-white dark:bg-gray-800"}
        `}
                                placeholder="e.g. 30"
                            />
                            <Err field="days" />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (INR)</label>
                            <div className="mt-1 relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                    ₹
                                </div>
                                <input
                                    type="number"
                                    min={0}
                                    value={price === "" ? "" : String(price)}
                                    onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                    className="block w-full pl-8 border rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                                    placeholder="e.g. 499"
                                />
                            </div>
                            <Err field="price" />
                        </div>
                    </div>

                    {/* VEHICLE TYPE + CATEGORY + RIDE LIMIT */}
                    {!isUnlimited && (
                        <div
                            className={`grid grid-cols-1 ${vehicleType === "car" ? "md:grid-cols-3" : "md:grid-cols-2"
                                } gap-3`}
                        >
                            {/* Vehicle type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Vehicle type <span className="text-red-600">*</span>
                                </label>
                                <select
                                    value={vehicleType}
                                    onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                                    disabled={!!initial}
                                    className={`mt-1 block w-full border rounded-md px-3 py-2
        ${initial ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white dark:bg-gray-800"}
    `}
                                >
                                    <option value="">Select vehicle</option>
                                    <option value="bike">Bike</option>
                                    <option value="auto">Auto</option>
                                    <option value="car">Car</option>
                                </select>
                                <Err field="vehicleType" />
                            </div>

                            {/* Car category — SECOND COLUMN ONLY WHEN CAR */}
                            {vehicleType === "car" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Category (cars only) <span className="text-red-600">*</span>
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as Category)}
                                        className="mt-1 block w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                                    >
                                        <option value="">Select category</option>
                                        <option value="economy">Economy</option>
                                        <option value="premium">Premium</option>
                                    </select>
                                    <Err field="category" />
                                </div>
                            )}


                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Ride limit <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={rideLimit === "" ? "" : String(rideLimit)}
                                    onChange={(e) => setRideLimit(e.target.value === "" ? "" : Number(e.target.value))}
                                    className="mt-1 block w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                                    placeholder="e.g. 50"
                                />
                                <Err field="rideLimit" />
                            </div>
                        </div>
                    )}

                    {/* DESCRIPTION FIELD */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description <span className="text-sm text-gray-400">(optional)</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                            placeholder="Describe the plan, perks, or restrictions (optional)."
                        />
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => onClose()}
                            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className={`px-4 py-2 rounded-md text-white ${saving ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
                                }`}
                            disabled={saving}
                        >
                            {saving
                                ? (initial ? "Updating..." : "Creating...")
                                : (initial ? "Update Plan" : "Create Plan")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
