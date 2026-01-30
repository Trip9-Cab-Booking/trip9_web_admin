"use client";

import React, { useEffect, useMemo, useState } from "react";
import PriceInput from "./ui/price-input/PriceInput";
import { axiosInstance } from "@/utils/axiosInstance";
import FarePreview from "./FarePreview";
import PromoDiscountControl from "./PromoDiscountControl";
import { Promo, PromoForm } from "@/types/promo";
import CustomSnackbar from "./CustomSnackbar";
import Pagination from "./ui/pagination";

type Mode = "view" | "edit" | "create";

type VehicleCategory = "bike" | "auto" | "car_economy" | "car_premium";

// Pricing Control

type PricingScope =
  | { type: "global" }
  | { type: "category"; category: VehicleCategory };

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
  const [globalModelId, setGlobalModelId] = useState<string | null>(null);
  const [categoryModelId, setCategoryModelId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });
  const [activeTab, setActiveTab] = useState<"settings" | "promo">("settings");
  // Promo list 
  const [promos, setPromos] = useState<Promo[]>([]);
  const [newPromo, setNewPromo] = useState<PromoForm>({
    code: "",
    type: "PERCENTAGE",
    value: 10,
    validFrom: "",
    validTo: "",
    maxDiscountPerRide: 100,
    totalUsageLimit: 1000,
  });
  // Fare preview inputs
  const [preview, setPreview] = useState({ distanceKm: 12, durationMin: 20, category: "car_economy" as VehicleCategory, applyPromoCode: "" });
  const [hasPricing, setHasPricing] = useState(true);
  // Pricing active states
  const [globalActive, setGlobalActive] = useState<boolean>(false);
  const [categoryActive, setCategoryActive] = useState<boolean>(false);
  const [activeScope, setActiveScope] = useState<PricingScope>({
    type: "global",
  });
  const [mode, setMode] = useState<Mode>("view");
  const [promoRefreshKey, setPromoRefreshKey] = useState(0);

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
  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" = "info"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const savePromo = async () => {
    try {
      const payload = {
        couponCode: newPromo.code.trim().toUpperCase(),
        type: newPromo.type,
        value: newPromo.value,
        validFrom: new Date(newPromo.validFrom!).toISOString(),
        validTo: new Date(newPromo.validTo!).toISOString(),
        maxDiscountPerRide: newPromo.maxDiscountPerRide,
        totalUsageLimit: newPromo.totalUsageLimit,
      };

      if (newPromo.couponId) {
        // UPDATE
        await axiosInstance.put(
          `/api/admin/coupon/update/${newPromo.couponId}`,
          payload
        );

        setSnackbar({
          open: true,
          message: "Coupon updated successfully",
          severity: "success",
        });
      } else {
        //  CREATE
        await axiosInstance.post(
          "/api/admin/coupon/create",
          payload
        );

        setSnackbar({
          open: true,
          message: "Coupon created successfully",
          severity: "success",
        });
      }

      //  Refresh list & reset form
      // await fetchCoupons(1);
      // setPage(1);
      // onRefresh();

      setNewPromo({
        code: "",
        type: "PERCENTAGE",
        value: 10,
        validFrom: "",
        validTo: "",
        maxDiscountPerRide: 100,
        totalUsageLimit: 1000,
      });
    } catch (error: any) {
      const backendError =
        error?.response?.data?.errors?.[0] ||
        error?.response?.data?.message ||
        "Failed to save coupon";

      setSnackbar({
        open: true,
        message: backendError,
        severity: "error",
      });
    }
  };

  const removePromo = async (couponId: string) => {
    try {
      await axiosInstance.delete(
        `/api/admin/coupon/delete/${couponId}`
      );

      // await fetchCoupons(page);
      setSnackbar({
        open: true,
        message: "Coupon deleted successfully",
        severity: "success",
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || "Failed to delete coupon",
        severity: "error",
      });
    }
  };

  // GET PRICING LIST ON MOUNT
  useEffect(() => {
    const loadPricing = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get("/api/admin/pricing/list");
        const list = res.data?.data ?? [];

        setPricingRaw(list);
        if (list.length === 0) {
          setHasPricing(false);
          return;
        }

        setHasPricing(true);
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
          setGlobalModelId(globalModel._id);
          setGlobalActive(!!globalModel.isActive);
        }
        const categoryModel = list.find(
          (item: any) => !item.isGlobalPriceModel
        );

        if (categoryModel?.pricing?.length) {
          setCategoryModelId(categoryModel._id);
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

  // SAVE PRICING SETTINGS
  const saveSettings = async () => {
    try {
      const isCreate = mode === "create";
      let payload: any;
      if (activeScope.type === "global") {
        if (isCreate) {
          payload = {
            isGlobalPriceModel: true,
            // isActive: globalActive,
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
          payload = {
            isGlobalPriceModel: true,
            // isActive: globalActive,
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
      if (activeScope.type === "category") {
        if (isCreate) {
          payload = {
            isGlobalPriceModel: false,
            // isActive: categoryActive,
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
          payload = {
            isGlobalPriceModel: false,
            // isActive: categoryActive,
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

  const updateGlobalStatus = async (checked: boolean) => {
    if (!globalModelId) return;

    try {
      setGlobalActive(checked);

      await axiosInstance.put(
        `/api/admin/pricing/updateStatus/${globalModelId}`,
        { isActive: checked }
      );

      showSnackbar(
        `Global pricing ${checked ? "activated" : "deactivated"}`,
        "success"
      );
    } catch (error) {
      setGlobalActive((prev) => !prev);
      showSnackbar("Failed to update global pricing status", "error");
      console.error(error);
    }
  };

  // UPDATE CATEGORY PRICING STATUS
  const updateCategoryStatus = async (checked: boolean) => {
    if (!categoryModelId) return;

    try {
      setCategoryActive(checked);

      await axiosInstance.put(
        `/api/admin/pricing/updateStatus/${categoryModelId}`,
        { isActive: checked }
      );

      showSnackbar(
        `Category pricing ${checked ? "activated" : "deactivated"}`,
        "success"
      );
    } catch (error) {
      setCategoryActive((prev) => !prev);
      showSnackbar("Failed to update category pricing status", "error");
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Pricing Control</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1 bg-white rounded-lg shadow p-4 dark:bg-gray-800">
          <nav className="space-y-2">
            <button onClick={() => setActiveTab("settings")} className={`w-full text-left px-3 py-2  rounded ${activeTab === "settings" ? "bg-indigo-600 text-white" : "hover:bg-gray-50 dark:hover:bg-gray-700"}`}>Pricing Settings</button>
            <button onClick={() => setActiveTab("promo")} className={`w-full text-left px-3 py-2 rounded ${activeTab === "promo" ? "bg-indigo-600 text-white" : "hover:bg-gray-50 dark:hover:bg-gray-700"}`}>Coupons</button>
          </nav>
        </aside>

        <main className="md:col-span-2 bg-white rounded-lg shadow p-6 dark:bg-gray-800">
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
                <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
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

                      {/* ACTIVE CHECKBOX — GLOBAL */}
                      {(mode === "create" || mode === "edit" || mode === "view") && (
                        <div className="mt-4 flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={globalActive}
                            disabled={mode === "view"}
                            onChange={(e) => updateGlobalStatus(e.target.checked)}
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
                            onChange={(e) => updateCategoryStatus(e.target.checked)}
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
            <>
              <PromoDiscountControl
                newPromo={newPromo}
                setNewPromo={setNewPromo}
                savePromo={savePromo}
                removePromo={removePromo}
                onRefresh={() => setPromoRefreshKey((k) => k + 1)}
              />
            </>
          )}

        </main>
        <FarePreview />

        <CustomSnackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={closeSnackbar}
        />

      </div>
    </div>
  );
}
