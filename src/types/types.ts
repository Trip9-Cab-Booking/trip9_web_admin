// src/types/types.ts
export type VehicleType = "car_economy" | "car_premium" | "bike" | "auto";
export type RideLimitPeriod = "daily" | "weekly" | "monthly" | "yearly" | "unlimited";

// union used by form components / payloads
export type SubscriptionType = "daily" | "weekly" | "monthly" | "yearly" | "unlimited";

export type VehiclePricingEntry = {
    price?: number;
    durationDays?: number;
    rideLimit?: number;
};

export type Plan = {
    id: string;
    name: string;
    subscriptionType?: SubscriptionType;
    pricePerMonth?: number;
    durationMonths?: number;
    days?: number | null;
    isUnlimited?: boolean;
    description?: string;
    isActive?: boolean;
    vehicleTypes?: VehicleType[];
    vehiclePricing?: Partial<Record<VehicleType, VehiclePricingEntry>>;
    rideLimit?: number;
    rideLimitPeriod?: RideLimitPeriod;
    rideLimitPeriodDays?: number;
};

export type Driver = {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    planId?: string | null;
    driverName?: string | null;
    mobile?: string | null;
    walletBalance?: number;
    _id?: string;
    driverId?: string;
    subscriptionPlanId?: string | null;
    subscriptionStart?: string | null;
    subscriptionEnd?: string | null;
};

export type Payment = {
    id: string;
    driverId: string;
    amount: number;
    date: string;
    planId?: string | null;
};

// helpers
export const formatCurrency = (n: number) => `₹${n.toFixed(2)}`;
export const todayISO = () => new Date().toISOString();

// UI meta (if you use it inside TS files)
import React from "react";
const VEHICLE_META: Record<VehicleType, { label: string; emoji?: string; svg?: React.ReactNode }> = {
    car_economy: { label: "Car (economy)", emoji: "🚗" },
    car_premium: { label: "Car (premium)", emoji: "🚘" },
    auto: { label: "Auto", emoji: "🛺" },
    bike: { label: "Bike", emoji: "🏍️" },
};
