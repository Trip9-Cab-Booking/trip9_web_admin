"use client";

import React, { useEffect, useMemo, useState } from "react";
import PriceInput from "./ui/price-input/PriceInput";
import { axiosInstance } from "@/utils/axiosInstance";
import FarePreview from "./FarePreview";

type VehicleCategory = "bike" | "auto" | "car_economy" | "car_premium";

type CategoryPricing = Record<VehicleCategory, {
  baseFare: number;
  perKm: number;
  perMin: number;
  minimumFare: number;
}>;

type NightCharge = {
  enabled: boolean;
  start: string;
  end: string;
  type: "percentage" | "flat";
  value: number;
};

type Surge = {
  enabled: boolean;
  mode: "manual" | "rule_based";
  multiplier: number;
};

type Promo = {
  code: string;
  type: "flat" | "percentage";
  value: number;
  validFrom?: string;
  validTo?: string;
  maxDiscountPerRide?: number;
  totalUsageLimit?: number;
};

type PricingScope =
  | { type: "global" }
  | { type: "category"; category: VehicleCategory };

type Mode = "view" | "edit" | "create";

type PriceConfig = {
  baseFare: number | "";
  perKm: number | "";
  perMin: number | "";
  minimumFare: number | "";
};


export const fetchPricingList = async () => {
  const res = await axiosInstance.get(
    "/api/admin/pricing/list"
  );
  return res.data;
};

export const updatePricing = async (payload: any) => {
  return axiosInstance.put("/api/admin/pricing/update", payload);
};

export default function PricingControl() {

  const [loading, setLoading] = useState(false);
  const [pricingRaw, setPricingRaw] = useState<any[]>([]);
  const [pricingIds, setPricingIds] = useState<{
    global?: string;
    bike?: string;
    auto?: string;
    car_economy?: string;
    car_premium?: string;
  }>({});
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });



  const [activeScope, setActiveScope] = useState<PricingScope>({
    type: "global",
  });

  const [mode, setMode] = useState<Mode>("view");

  /* -------- Global Pricing -------- */
  const [shared, setShared] = useState<PriceConfig>({
    baseFare: 50,
    perKm: 10,
    perMin: 1,
    minimumFare: 60,
  });

  const EMPTY_SHARED: PriceConfig = {
    baseFare: "",
    perKm: "",
    perMin: "",
    minimumFare: "",
  };

  const EMPTY_CATEGORIES: Record<VehicleCategory, PriceConfig> = {
    bike: { baseFare: "", perKm: "", perMin: "", minimumFare: "" },
    auto: { baseFare: "", perKm: "", perMin: "", minimumFare: "" },
    car_economy: { baseFare: "", perKm: "", perMin: "", minimumFare: "" },
    car_premium: { baseFare: "", perKm: "", perMin: "", minimumFare: "" },
  };


  const [sharedSnapshot, setSharedSnapshot] =
    useState<PriceConfig>(shared);

  /* -------- Category Pricing -------- */
  const [categories, setCategories] = useState<
    Record<VehicleCategory, PriceConfig>
  >({
    bike: { baseFare: 30, perKm: 8, perMin: 1, minimumFare: 40 },
    auto: { baseFare: 40, perKm: 9, perMin: 1, minimumFare: 50 },
    car_economy: { baseFare: 60, perKm: 12, perMin: 2, minimumFare: 80 },
    car_premium: { baseFare: 80, perKm: 15, perMin: 3, minimumFare: 120 },
  });

  const [categorySnapshot, setCategorySnapshot] =
    useState(categories);

  /* -------------------- Handlers -------------------- */

  const startEdit = () => {
    setSharedSnapshot(shared);
    setCategorySnapshot(categories);
    setMode("edit");
  };

  const cancelEdit = () => {
    setShared(sharedSnapshot);
    setCategories(categorySnapshot);
    setMode("view");
  };

  const handleCategoryChange = (
    cat: VehicleCategory,
    field: keyof PriceConfig,
    value: number | ""
  ) => {
    setCategories((prev) => ({
      ...prev,
      [cat]: { ...prev[cat], [field]: value },
    }));
  };

  const [activeTab, setActiveTab] = useState<"settings" | "promo">("settings");

  // Global settings
  const [nightCharge, setNightCharge] = useState<NightCharge>({ enabled: false, start: "22:00", end: "05:00", type: "percentage", value: 20 });
  const [surge, setSurge] = useState<Surge>({ enabled: false, mode: "manual", multiplier: 1.0 });

  // Promo list 
  const [promos, setPromos] = useState<Promo[]>([]);
  const [newPromo, setNewPromo] = useState<Promo>({ code: "", type: "percentage", value: 10, validFrom: undefined, validTo: undefined, maxDiscountPerRide: 100, totalUsageLimit: 1000 });

  // Fare preview inputs
  const [preview, setPreview] = useState({ distanceKm: 12, durationMin: 20, category: "car_economy" as VehicleCategory, applyPromoCode: "" });

  const [hasPricing, setHasPricing] = useState(true);

  const [globalActive, setGlobalActive] = useState<boolean>(false);
  const [categoryActive, setCategoryActive] = useState<boolean>(false);



  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" = "info"
  ) => {
    setSnackbar({ open: true, message, severity });
  };


  const addPromo = () => {
    if (!newPromo.code.trim()) return alert("Promo code required");
    setPromos(p => [newPromo, ...p]);
    setNewPromo({ code: "", type: "percentage", value: 10, validFrom: undefined, validTo: undefined, maxDiscountPerRide: 100, totalUsageLimit: 1000 });
  };

  const removePromo = (code: string) => setPromos(p => p.filter(x => x.code !== code));

  const estimatedFare = useMemo(() => {
    const cat = categories[preview.category];
    const distance = Math.max(0, preview.distanceKm);
    const duration = Math.max(0, preview.durationMin);

    const baseFare = Number(cat.baseFare || 0);
    const perKm = Number(cat.perKm || 0);
    const perMin = Number(cat.perMin || 0);
    const minFare = Number(cat.minimumFare || 0);

    let fare = baseFare + perKm * distance + perMin * duration;
    fare = Math.max(fare, minFare);
    // night charge (simple check: if enabled and current preview time would fall into range - for demo we'll assume night applies if start > end or some simple rule)
    if (nightCharge.enabled) {
      if (nightCharge.type === "percentage") fare += (fare * (nightCharge.value / 100));
      else fare += nightCharge.value;
    }

    // surge
    if (surge.enabled) fare *= surge.multiplier;

    // promo
    const promo = promos.find(p => p.code === preview.applyPromoCode.trim().toUpperCase());
    let discount = 0;
    if (promo) {
      if (promo.type === "percentage") discount = (fare * (promo.value / 100));
      else discount = promo.value;
      if (promo.maxDiscountPerRide) discount = Math.min(discount, promo.maxDiscountPerRide);
    }

    const final = Math.max(0, fare - discount);
    return {
      baseCalc: fare.toFixed(2),
      discount: discount.toFixed(2),
      final: final.toFixed(2),
    };
  }, [preview, categories, nightCharge, surge, promos]);

  useEffect(() => {
    const loadPricing = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get("/api/admin/pricing/list");
        const list = res.data?.data ?? [];

        setPricingRaw(list);

        // ✅ EMPTY STATE CHECK
        if (list.length === 0) {
          setHasPricing(false);
          return;
        }

        setHasPricing(true);

        // ---------- GLOBAL PRICING ----------
        const globalModel = list.find((item: any) => item.isGlobalPriceModel);

        if (globalModel?.pricing?.length) {
          const g = globalModel.pricing[0];

          setShared({
            baseFare: g.baseFare,
            perKm: g.perKmRate,
            perMin: g.perMinRate,
            minimumFare: g.minimumFare,
          });

          setPricingIds((prev) => ({
            ...prev,
            global: g.pricingId,
          }));

          setGlobalActive(!!globalModel.isActive);
        }

        // ---------- CATEGORY PRICING ----------
        const categoryModel = list.find(
          (item: any) => !item.isGlobalPriceModel
        );

        if (categoryModel?.pricing?.length) {
          setCategoryActive(!!categoryModel.isActive);
          const updated = { ...categories };

          categoryModel.pricing.forEach((p: any) => {
            if (p.vehicleType === "bike") {
              updated.bike = {
                baseFare: p.baseFare,
                perKm: p.perKmRate,
                perMin: p.perMinRate,
                minimumFare: p.minimumFare,
              };
              setPricingIds((prev) => ({ ...prev, bike: p.pricingId }));
            }

            if (p.vehicleType === "auto") {
              updated.auto = {
                baseFare: p.baseFare,
                perKm: p.perKmRate,
                perMin: p.perMinRate,
                minimumFare: p.minimumFare,
              };
              setPricingIds((prev) => ({ ...prev, auto: p.pricingId }));
            }

            if (p.vehicleType === "car" && p.vehicleCategory === "economy") {
              updated.car_economy = {
                baseFare: p.baseFare,
                perKm: p.perKmRate,
                perMin: p.perMinRate,
                minimumFare: p.minimumFare,
              };
              setPricingIds((prev) => ({ ...prev, car_economy: p.pricingId }));
            }

            if (p.vehicleType === "car" && p.vehicleCategory === "premium") {
              updated.car_premium = {
                baseFare: p.baseFare,
                perKm: p.perKmRate,
                perMin: p.perMinRate,
                minimumFare: p.minimumFare,
              };
              setPricingIds((prev) => ({ ...prev, car_premium: p.pricingId }));
            }
          });

          setCategories(updated);
        }
      } catch (err) {
        console.error("Failed to fetch pricing", err);
      } finally {
        setLoading(false);
      }
    };

    loadPricing();
  }, []);

  const saveSettings = async () => {
    try {
      const isCreate = mode === "create";
      let payload: any;

      /* =========================================================
         GLOBAL PRICING
         ========================================================= */
      if (activeScope.type === "global") {
        if (isCreate) {
          // ---------- GLOBAL CREATE ----------
          payload = {
            isGlobalPriceModel: true,
            isActive: globalActive,
            pricing: [
              {
                vehicleType: "all",
                vehicleCategory: "all",
                baseFare: shared.baseFare,
                perKmRate: shared.perKm,
                perMinRate: shared.perMin,
                minimumFare: shared.minimumFare,
              },
            ],
          };
        } else {
          // ---------- GLOBAL UPDATE ----------
          payload = {
            isGlobalPriceModel: true,
            isActive: globalActive,
            pricingIds: [
              {
                pricingId: pricingIds.global,
                baseFare: shared.baseFare,
                perKmRate: shared.perKm,
                perMinRate: shared.perMin,
                minimumFare: shared.minimumFare,
              },
            ],
          };
        }
      }

      /* =========================================================
         CATEGORY PRICING
         ========================================================= */
      if (activeScope.type === "category") {
        if (isCreate) {
          // ---------- CATEGORY CREATE ----------
          payload = {
            isGlobalPriceModel: false,
            isActive: categoryActive,
            pricing: [
              {
                vehicleType: "bike",
                baseFare: categories.bike.baseFare,
                perKmRate: categories.bike.perKm,
                perMinRate: categories.bike.perMin,
                minimumFare: categories.bike.minimumFare,
              },
              {
                vehicleType: "auto",
                baseFare: categories.auto.baseFare,
                perKmRate: categories.auto.perKm,
                perMinRate: categories.auto.perMin,
                minimumFare: categories.auto.minimumFare,
              },
              {
                vehicleType: "car",
                vehicleCategory: "economy",
                baseFare: categories.car_economy.baseFare,
                perKmRate: categories.car_economy.perKm,
                perMinRate: categories.car_economy.perMin,
                minimumFare: categories.car_economy.minimumFare,
              },
              {
                vehicleType: "car",
                vehicleCategory: "premium",
                baseFare: categories.car_premium.baseFare,
                perKmRate: categories.car_premium.perKm,
                perMinRate: categories.car_premium.perMin,
                minimumFare: categories.car_premium.minimumFare,
              },
            ],
          };
        } else {
          // ---------- CATEGORY UPDATE ----------
          payload = {
            isGlobalPriceModel: false,
            isActive: categoryActive,
            pricingIds: [
              {
                pricingId: pricingIds.bike,
                baseFare: categories.bike.baseFare,
                perKmRate: categories.bike.perKm,
                perMinRate: categories.bike.perMin,
                minimumFare: categories.bike.minimumFare,
              },
              {
                pricingId: pricingIds.auto,
                baseFare: categories.auto.baseFare,
                perKmRate: categories.auto.perKm,
                perMinRate: categories.auto.perMin,
                minimumFare: categories.auto.minimumFare,
              },
              {
                pricingId: pricingIds.car_economy,
                baseFare: categories.car_economy.baseFare,
                perKmRate: categories.car_economy.perKm,
                perMinRate: categories.car_economy.perMin,
                minimumFare: categories.car_economy.minimumFare,
              },
              {
                pricingId: pricingIds.car_premium,
                baseFare: categories.car_premium.baseFare,
                perKmRate: categories.car_premium.perKm,
                perMinRate: categories.car_premium.perMin,
                minimumFare: categories.car_premium.minimumFare,
              },
            ],
          };
        }
      }

      if (isCreate) {
        await axiosInstance.post("/api/admin/pricing/create", payload);
      } else {
        await axiosInstance.put("/api/admin/pricing/update", payload);
      }

      setMode("view");
      console.log("Pricing saved successfully");
    } catch (error) {
      console.error("Pricing save failed", error);
    }
  };



  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Pricing Control</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1 bg-white rounded-lg shadow p-4">
          <nav className="space-y-2">
            <button onClick={() => setActiveTab("settings")} className={`w-full text-left px-3 py-2 rounded ${activeTab === "settings" ? "bg-indigo-600 text-white" : "hover:bg-gray-50"}`}>Pricing Settings</button>
            <button onClick={() => setActiveTab("promo")} className={`w-full text-left px-3 py-2 rounded ${activeTab === "promo" ? "bg-indigo-600 text-white" : "hover:bg-gray-50"}`}>Promo & Discounts</button>
          </nav>
        </aside>

        <main className="md:col-span-2 bg-white rounded-lg shadow p-6">
          {!loading && !hasPricing && (
            <div className="border border-dashed rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No pricing plans found</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create a pricing plan to start configuring fares.
              </p>

              <button
                onClick={() => {
                  setMode("create");
                  setActiveScope({ type: "global" });
                  setShared(EMPTY_SHARED);
                  setCategories(EMPTY_CATEGORIES);
                  setGlobalActive(true);
                  setCategoryActive(true);
                  setPricingIds({
                    global: undefined,
                    bike: undefined,
                    auto: undefined,
                    car_economy: undefined,
                    car_premium: undefined,
                  });
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded text-sm"
              >
                Create New Plan
              </button>

            </div>
          )}

          {(hasPricing || mode === "create") && (
            <>
              {activeTab === "settings" && (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex gap-4 mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={activeScope.type === "global"}
                        disabled={mode === "edit"}
                        onChange={() => setActiveScope({ type: "global" })}
                      />
                      <span className="font-medium">Global Pricing</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={activeScope.type === "category"}
                        disabled={mode === "edit"}
                        onChange={() =>
                          setActiveScope({ type: "category", category: "bike" })
                        }
                      />
                      <span className="font-medium">Vehicle Category Pricing</span>
                    </label>
                  </div>
                  {activeScope.type === "global" && (
                    <section className="border rounded-lg p-4">
                      <div className="flex justify-between mb-3">
                        <h3 className="text-lg font-medium">Global Pricing</h3>
                        {mode === "view" ? (
                          <button onClick={startEdit} className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm">
                            Edit
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={saveSettings}
                              className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm"
                            >
                              {mode === "create" ? "Create" : "Save"}
                            </button>

                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1.5 bg-gray-200 rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                      </div>



                      <div
                        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${mode === "view" ? "pointer-events-none opacity-60" : ""
                          }`}
                      >
                        <PriceInput
                          label="Base Fare"
                          value={shared.baseFare}
                          onChange={(v) =>
                            setShared((s) => ({ ...s, baseFare: v }))
                          }
                        />
                        <PriceInput
                          label="Per Km"
                          value={shared.perKm}
                          onChange={(v) =>
                            setShared((s) => ({ ...s, perKm: v }))
                          }
                        />
                        <PriceInput
                          label="Per Minute"
                          value={shared.perMin}
                          onChange={(v) =>
                            setShared((s) => ({ ...s, perMin: v }))
                          }
                        />
                        <PriceInput
                          label="Minimum Fare"
                          value={shared.minimumFare}
                          onChange={(v) =>
                            setShared((s) => ({ ...s, minimumFare: v }))
                          }
                        />
                      </div>

                      {/* ✅ ACTIVE CHECKBOX — GLOBAL */}
                      {(mode === "create" || mode === "edit" || mode === "view") && (
                        <div className="mt-4 flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={globalActive}
                            disabled={mode === "view"}
                            onChange={(e) => setGlobalActive(e.target.checked)}
                          />
                          <span className="text-sm font-medium">
                            Set Global Pricing as Active
                          </span>
                        </div>
                      )}
                    </section>
                  )}
                  {activeScope.type === "category" && (
                    <section className="space-y-3">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-medium">Vehicle Category Pricing</h3>

                        {mode === "view" ? (
                          <button
                            onClick={startEdit}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm"
                          >
                            Edit
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={saveSettings}
                              className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm"
                            >
                              {mode === "create" ? "Create" : "Save"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1.5 bg-gray-200 rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>

                      {(Object.keys(categories) as VehicleCategory[]).map((cat) => (
                        <div
                          key={cat}
                          className="border rounded-lg p-4 transition"
                        >
                          <div className="mb-3 font-medium capitalize">
                            {cat.replace("car_", "Car - ").replace("_", " ")}
                          </div>

                          <div
                            className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${mode === "view" ? "pointer-events-none opacity-60" : ""
                              }`}
                          >
                            <PriceInput
                              label="Base"
                              value={categories[cat].baseFare}
                              onChange={(v) =>
                                handleCategoryChange(cat, "baseFare", v)
                              }
                            />
                            <PriceInput
                              label="Per Km"
                              value={categories[cat].perKm}
                              onChange={(v) =>
                                handleCategoryChange(cat, "perKm", v)
                              }
                            />
                            <PriceInput
                              label="Per Min"
                              value={categories[cat].perMin}
                              onChange={(v) =>
                                handleCategoryChange(cat, "perMin", v)
                              }
                            />
                            <PriceInput
                              label="Minimum"
                              value={categories[cat].minimumFare}
                              onChange={(v) =>
                                handleCategoryChange(cat, "minimumFare", v)
                              }
                            />
                          </div>
                        </div>
                      ))}

                      {(mode === "create" || mode === "edit" || mode === "view") && (
                        <div className="mb-3 flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={categoryActive}
                            disabled={mode === "view"}
                            onChange={(e) => setCategoryActive(e.target.checked)}
                          />
                          <span className="text-sm font-medium">
                            Set Category Pricing as Active
                          </span>
                        </div>
                      )}

                    </section>
                  )}
                </div>
              )}

            </>
          )}

          {activeTab === "promo" && (
            <section>
              <h3 className="text-lg font-medium mb-3">Promo & Discount Control</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 border rounded">
                  <h4 className="font-medium mb-2">Create Promo</h4>
                  <label className="text-xs">Code</label>
                  <input value={newPromo.code} onChange={e => setNewPromo(p => ({ ...p, code: e.target.value.toUpperCase() }))} className="mt-1 block w-full rounded border p-2" />

                  <label className="text-xs mt-2">Type</label>
                  <select value={newPromo.type} onChange={e => setNewPromo(p => ({ ...p, type: e.target.value as any }))} className="block w-full mt-1 rounded border p-2">
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat</option>
                  </select>

                  <label className="text-xs mt-2">Value</label>
                  <input type="number" value={newPromo.value} onChange={e => setNewPromo(p => ({ ...p, value: Number(e.target.value) }))} className="mt-1 block w-full rounded border p-2" />

                  <label className="text-xs mt-2">Validity from</label>
                  <input type="datetime-local" value={newPromo.validFrom ?? ""} onChange={e => setNewPromo(p => ({ ...p, validFrom: e.target.value }))} className="mt-1 block w-full rounded border p-2" />

                  <label className="text-xs mt-2">Validity to</label>
                  <input type="datetime-local" value={newPromo.validTo ?? ""} onChange={e => setNewPromo(p => ({ ...p, validTo: e.target.value }))} className="mt-1 block w-full rounded border p-2" />

                  <label className="text-xs mt-2">Max discount per ride</label>
                  <input type="number" value={newPromo.maxDiscountPerRide} onChange={e => setNewPromo(p => ({ ...p, maxDiscountPerRide: Number(e.target.value) }))} className="mt-1 block w-full rounded border p-2" />

                  <label className="text-xs mt-2">Total usage limit</label>
                  <input type="number" value={newPromo.totalUsageLimit} onChange={e => setNewPromo(p => ({ ...p, totalUsageLimit: Number(e.target.value) }))} className="mt-1 block w-full rounded border p-2" />

                  <div className="mt-3 flex gap-2">
                    <button onClick={addPromo} className="px-3 py-2 rounded bg-indigo-600 text-white">Create</button>
                    <button onClick={() => setNewPromo({ code: "", type: "percentage", value: 10, validFrom: undefined, validTo: undefined, maxDiscountPerRide: 100, totalUsageLimit: 1000 })} className="px-3 py-2 rounded bg-gray-200">Clear</button>
                  </div>
                </div>

                <div className="p-3 border rounded">
                  <h4 className="font-medium mb-2">Active Promos</h4>
                  <div className="space-y-2 max-h-64 overflow-auto">
                    {promos.length === 0 && <div className="text-sm text-gray-500">No promos yet</div>}
                    {promos.map(p => (
                      <div key={p.code} className="flex items-center justify-between border p-2 rounded">
                        <div>
                          <div className="font-medium">{p.code}</div>
                          <div className="text-xs text-gray-500">{p.type} • {p.value}{p.type === "percentage" ? "%" : ""}</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => removePromo(p.code)} className="px-2 py-1 rounded bg-red-500 text-white text-sm">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
        <FarePreview />
      </div>

      {/* <p className="text-xs text-gray-500 mt-4">This is a front-end UI prototype. Hook state updates to your backend APIs to persist pricing, apply rule-based surge, and validate promo usages.</p> */}
    </div>
  );
}
