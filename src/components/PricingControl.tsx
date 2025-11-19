'use client';

import { useState } from 'react';
import { BadgePercent, DollarSign, PlusCircle } from 'lucide-react';

export default function PricingControlPage() {
  const [baseFare, setBaseFare] = useState<number>(50);
  const [perKmRate, setPerKmRate] = useState<number>(10);
  const [discounts, setDiscounts] = useState<{ code: string; amount: number }[]>([
    { code: 'WELCOME10', amount: 10 },
    { code: 'SAVE20', amount: 20 },
  ]);

  const [newCode, setNewCode] = useState('');
  const [newAmount, setNewAmount] = useState<number>(0);

  const addDiscount = () => {
    if (newCode && newAmount > 0) {
      setDiscounts([...discounts, { code: newCode, amount: newAmount }]);
      setNewCode('');
      setNewAmount(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 px-6 py-10 text-gray-800">
      <div className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-orange-800 text-center">💸 Pricing Control Panel</h1>

        {/* Base Fare Section */}
        <section className="bg-white shadow-md p-6 rounded-2xl border-l-4 border-orange-500">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-orange-700">
            <DollarSign className="text-green-600" /> Base Fare & Per-Kilometre Charges
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium">Base Fare (₹)</label>
              <input
                type="number"
                value={baseFare}
                onChange={(e) => setBaseFare(parseFloat(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Per KM Rate (₹)</label>
              <input
                type="number"
                value={perKmRate}
                onChange={(e) => setPerKmRate(parseFloat(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
        </section>

        {/* Discount Section */}
        <section className="bg-white shadow-md p-6 rounded-2xl border-l-4 border-green-500">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-green-700">
            <BadgePercent className="text-blue-600" /> Manage Promotional Discounts
          </h2>

          {/* Existing Discounts */}
          <ul className="space-y-2 mb-4">
            {discounts.map((d, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-green-50 border border-green-200 px-4 py-2 rounded-lg"
              >
                <span className="font-semibold text-green-800">{d.code}</span>
                <span className="text-green-700">₹{d.amount} OFF</span>
              </li>
            ))}
          </ul>

          {/* Add New Discount */}
          <div className="grid gap-4 sm:grid-cols-3">
            <input
              type="text"
              placeholder="Promo Code"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <input
              type="number"
              placeholder="Discount Amount"
              value={newAmount}
              onChange={(e) => setNewAmount(Number(e.target.value))}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              onClick={addDiscount}
              className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg"
            >
              <PlusCircle size={18} /> Add Discount
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}


