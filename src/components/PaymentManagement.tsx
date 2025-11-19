'use client';

import { useState } from 'react';
import { Calendar, Trash2,  Plus } from 'lucide-react';

interface Charge {
  id: number;
  description: string;
  amount: number;
}

export default function PaymentManagementPage() {
  const [charges, setCharges] = useState<Charge[]>([
    { id: 1, description: 'Morning Shift', amount: 100 },
    { id: 2, description: 'Evening Shift', amount: 120 },
  ]);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);

  const [revenue] = useState({
    daily: 1500,
    weekly: 9800,
    monthly: 42000,
  });

  const addCharge = () => {
    if (description && amount > 0) {
      const newCharge: Charge = {
        id: Date.now(),
        description,
        amount,
      };
      setCharges([...charges, newCharge]);
      setDescription('');
      setAmount(0);
    }
  };

  const deleteCharge = (id: number) => {
    setCharges(charges.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-gray-800">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-blue-900 text-center">💳 Payment Management</h1>

        {/* Login Charges Management */}
        <section className="bg-white shadow-md p-6 rounded-2xl border-l-4 border-blue-500">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">Driver Login Charges</h2>

          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Shift Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="number"
              placeholder="Charge Amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={addCharge}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Charge
            </button>
          </div>

          <ul className="divide-y">
            {charges.map((charge) => (
              <li
                key={charge.id}
                className="flex justify-between items-center py-3 px-2 bg-blue-50 rounded-lg my-2 shadow-sm"
              >
                <span className="font-medium text-blue-700">{charge.description}</span>
                <div className="flex items-center gap-4">
                  <span className="text-blue-600 font-semibold">₹{charge.amount}</span>
                  <button onClick={() => deleteCharge(charge.id)}>
                    <Trash2 className="text-red-600 hover:text-red-800" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Revenue Summary */}
        <section className="bg-white shadow-md p-6 rounded-2xl border-l-4 border-green-500">
          <h2 className="text-2xl font-semibold text-green-800 mb-6 flex items-center gap-2">
            <Calendar className="text-green-600" /> Revenue Summary
          </h2>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-green-50 p-4 rounded-xl border border-green-200 shadow-sm text-center">
              <h3 className="text-lg font-semibold text-green-700">Daily</h3>
              <p className="text-2xl text-green-800 font-bold">₹{revenue.daily}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-200 shadow-sm text-center">
              <h3 className="text-lg font-semibold text-green-700">Weekly</h3>
              <p className="text-2xl text-green-800 font-bold">₹{revenue.weekly}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl border border-green-200 shadow-sm text-center">
              <h3 className="text-lg font-semibold text-green-700">Monthly</h3>
              <p className="text-2xl text-green-800 font-bold">₹{revenue.monthly}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
