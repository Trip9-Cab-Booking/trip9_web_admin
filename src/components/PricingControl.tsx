"use client";

import React, { useMemo, useState } from "react";

type VehicleCategory = "bike" | "auto" | "car_economic" | "car_premium";

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

export default function PricingControl() {
  const [activeTab, setActiveTab] = useState<"settings" | "categories" | "promo">("settings");

  // Global settings
  const [nightCharge, setNightCharge] = useState<NightCharge>({ enabled: false, start: "22:00", end: "05:00", type: "percentage", value: 20 });
  const [surge, setSurge] = useState<Surge>({ enabled: false, mode: "manual", multiplier: 1.0 });

  // Shared default settings (shown as fallback)
  const [shared, setShared] = useState({ baseFare: 25, perKm: 8, perMin: 1.5, minimumFare: 50 });

  // Categories
  const [categories, setCategories] = useState<CategoryPricing>({
    bike: { baseFare: 10, perKm: 4, perMin: 0.5, minimumFare: 30 },
    auto: { baseFare: 20, perKm: 6, perMin: 1, minimumFare: 40 },
    car_economic: { baseFare: 25, perKm: 8, perMin: 1.5, minimumFare: 50 },
    car_premium: { baseFare: 50, perKm: 15, perMin: 2.5, minimumFare: 120 },
  });

  // Promo list (local only)
  const [promos, setPromos] = useState<Promo[]>([]);
  const [newPromo, setNewPromo] = useState<Promo>({ code: "", type: "percentage", value: 10, validFrom: undefined, validTo: undefined, maxDiscountPerRide: 100, totalUsageLimit: 1000 });

  // Fare preview inputs
  const [preview, setPreview] = useState({ distanceKm: 12, durationMin: 20, category: "car_economic" as VehicleCategory, applyPromoCode: "" });

  const handleCategoryChange = (cat: VehicleCategory, field: keyof CategoryPricing[VehicleCategory], value: number) => {
    setCategories(prev => ({ ...prev, [cat]: { ...prev[cat], [field]: value } }));
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

    let fare = cat.baseFare + cat.perKm * distance + cat.perMin * duration;

    // apply minimum
    fare = Math.max(fare, cat.minimumFare);

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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Pricing Control</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1 bg-white rounded-lg shadow p-4">
          <nav className="space-y-2">
            {/* <button onClick={() => setActiveTab("settings")} className={`w-full text-left px-3 py-2 rounded ${activeTab === "settings" ? "bg-indigo-600 text-white" : "hover:bg-gray-50"}`}>Pricing Settings</button> */}
            <button onClick={() => setActiveTab("categories")} className={`w-full text-left px-3 py-2 rounded ${activeTab === "categories" ? "bg-indigo-600 text-white" : "hover:bg-gray-50"}`}>Vehicle Categories</button>
            <button onClick={() => setActiveTab("promo")} className={`w-full text-left px-3 py-2 rounded ${activeTab === "promo" ? "bg-indigo-600 text-white" : "hover:bg-gray-50"}`}>Promo & Discounts</button>
          </nav>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-600">Quick actions</h3>
            <div className="flex gap-2 mt-2">
              <button className="px-3 py-2 rounded bg-indigo-600 text-white text-sm">Save settings</button>
              <button className="px-3 py-2 rounded bg-gray-200 text-sm">Reset</button>
            </div>
          </div>
        </aside>

        <main className="md:col-span-2 bg-white rounded-lg shadow p-6">
          {activeTab === "settings" && (
            <section>
              <h3 className="text-lg font-medium mb-3">Global Pricing Settings</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Default Base Fare</label>
                  <input type="number" value={shared.baseFare} onChange={e => setShared(s => ({ ...s, baseFare: Number(e.target.value) }))} className="mt-1 block w-full rounded border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Per km rate</label>
                  <input type="number" value={shared.perKm} onChange={e => setShared(s => ({ ...s, perKm: Number(e.target.value) }))} className="mt-1 block w-full rounded border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Per minute rate</label>
                  <input type="number" value={shared.perMin} onChange={e => setShared(s => ({ ...s, perMin: Number(e.target.value) }))} className="mt-1 block w-full rounded border p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Minimum fare</label>
                  <input type="number" value={shared.minimumFare} onChange={e => setShared(s => ({ ...s, minimumFare: Number(e.target.value) }))} className="mt-1 block w-full rounded border p-2" />
                </div>
              </div>

              <div className="mt-6 border-t pt-4">
                <h4 className="font-medium mb-2">Night charges</h4>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={nightCharge.enabled} onChange={e => setNightCharge(n => ({ ...n, enabled: e.target.checked }))} />
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs">Start</label>
                      <input type="time" value={nightCharge.start} onChange={e => setNightCharge(n => ({ ...n, start: e.target.value }))} className="mt-1 block w-full rounded border p-1" />
                    </div>
                    <div>
                      <label className="block text-xs">End</label>
                      <input type="time" value={nightCharge.end} onChange={e => setNightCharge(n => ({ ...n, end: e.target.value }))} className="mt-1 block w-full rounded border p-1" />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <select value={nightCharge.type} onChange={e => setNightCharge(n => ({ ...n, type: e.target.value as any }))} className="rounded border p-2">
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat extra</option>
                  </select>
                  <input type="number" value={nightCharge.value} onChange={e => setNightCharge(n => ({ ...n, value: Number(e.target.value) }))} className="rounded border p-2" />
                </div>
              </div>

              <div className="mt-6 border-t pt-4">
                <h4 className="font-medium mb-2">Surge</h4>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={surge.enabled} onChange={e => setSurge(s => ({ ...s, enabled: e.target.checked }))} />
                  <label className="text-sm">Enable surge</label>
                </div>
                <div className="mt-3 flex gap-2 items-center">
                  <select value={surge.mode} onChange={e => setSurge(s => ({ ...s, mode: e.target.value as any }))} className="rounded border p-2">
                    <option value="manual">Manual</option>
                    <option value="rule_based">Rule-based</option>
                  </select>
                  <input type="number" step="0.1" value={surge.multiplier} onChange={e => setSurge(s => ({ ...s, multiplier: Number(e.target.value) }))} className="rounded border p-2" />
                </div>
              </div>
            </section>
          )}

          {activeTab === "categories" && (
            <section>
              <h3 className="text-lg font-medium mb-3">Vehicle Category Pricing</h3>
              <div className="space-y-4">
                {(["bike", "auto", "car_economic", "car_premium"] as VehicleCategory[]).map(cat => (
                  <div key={cat} className="p-3 border rounded flex flex-col sm:flex-row gap-3 items-center">
                    <div className="w-full sm:w-40 font-medium capitalize">{cat.replace("car_", "Car - ").replace("_", " ")}</div>
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <label className="block">
                        <div className="text-xs">Base</div>
                        <input type="number" value={categories[cat].baseFare} onChange={e => handleCategoryChange(cat, "baseFare", Number(e.target.value))} className="mt-1 block w-full rounded border p-2" />
                      </label>
                      <label className="block">
                        <div className="text-xs">Per km</div>
                        <input type="number" value={categories[cat].perKm} onChange={e => handleCategoryChange(cat, "perKm", Number(e.target.value))} className="mt-1 block w-full rounded border p-2" />
                      </label>
                      <label className="block">
                        <div className="text-xs">Per min</div>
                        <input type="number" value={categories[cat].perMin} onChange={e => handleCategoryChange(cat, "perMin", Number(e.target.value))} className="mt-1 block w-full rounded border p-2" />
                      </label>
                      <label className="block">
                        <div className="text-xs">Minimum</div>
                        <input type="number" value={categories[cat].minimumFare} onChange={e => handleCategoryChange(cat, "minimumFare", Number(e.target.value))} className="mt-1 block w-full rounded border p-2" />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </section>
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

        <aside className="md:col-span-1 bg-white rounded-lg shadow p-6">
          <h4 className="font-medium mb-2">Fare Preview</h4>
          <div className="space-y-2">
            <label className="text-xs">Category</label>
            <select value={preview.category} onChange={e => setPreview(p => ({ ...p, category: e.target.value as VehicleCategory }))} className="w-full rounded border p-2">
              <option value="bike">Bike</option>
              <option value="auto">Auto</option>
              <option value="car_economic">Car - Economic</option>
              <option value="car_premium">Car - Premium</option>
            </select>

            <label className="text-xs">Distance (km)</label>
            <input type="number" value={preview.distanceKm} onChange={e => setPreview(p => ({ ...p, distanceKm: Number(e.target.value) }))} className="w-full rounded border p-2" />

            <label className="text-xs">Duration (min)</label>
            <input type="number" value={preview.durationMin} onChange={e => setPreview(p => ({ ...p, durationMin: Number(e.target.value) }))} className="w-full rounded border p-2" />

            <label className="text-xs">Apply promo code</label>
            <input value={preview.applyPromoCode} onChange={e => setPreview(p => ({ ...p, applyPromoCode: e.target.value }))} className="w-full rounded border p-2" />

            <div className="mt-3 border-t pt-3">
              <div className="flex justify-between text-sm text-gray-600"><span>Calculated fare</span><span>₹{estimatedFare.baseCalc}</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Discount</span><span>-₹{estimatedFare.discount}</span></div>
              <div className="flex justify-between font-medium text-lg mt-2"><span>Final fare</span><span>₹{estimatedFare.final}</span></div>
            </div>
          </div>
        </aside>
      </div>

      {/* <p className="text-xs text-gray-500 mt-4">This is a front-end UI prototype. Hook state updates to your backend APIs to persist pricing, apply rule-based surge, and validate promo usages.</p> */}
    </div>
  );
}
