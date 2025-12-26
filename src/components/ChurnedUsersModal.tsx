import { useState } from "react";
import Modal from "./ui/modal/Modal";

type ChurnedUsersModalProps = {
    open: boolean;
    onClose: () => void;
};

function ChurnedUsersModal({ open, onClose }: ChurnedUsersModalProps) {
    const [minDays, setMinDays] = useState<number>(30);

    const users = [
        {
            id: "USR001",
            name: "Ranjima Ghosh",
            phone: "+91 9876543210",
            lastRide: "2024-12-01",
            inactiveDays: 42,
            lifetimeRides: 18,
            lifetimeSpend: 4200,
        },
    ];

    return (
        <Modal open={open} title="Churned Users" onClose={onClose}>
            {/* Context */}
            <p className="text-sm text-gray-500 mb-4">
                Users inactive for more than {minDays} days
            </p>

            {/* Filter */}
            <div className="flex items-center gap-3 mb-4">
                <label className="text-sm text-gray-600">
                    Inactive Days
                </label>
                <select
                    value={minDays}
                    onChange={(e) => setMinDays(Number(e.target.value))}
                    className="border rounded-lg px-3 py-2 text-sm"
                >
                    <option value={30}>30+ days</option>
                    <option value={45}>45+ days</option>
                    <option value={60}>60+ days</option>
                </select>
            </div>

            {/* Table */}
            <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="px-4 py-3 text-left">User</th>
                            <th className="px-4 py-3">Last Ride</th>
                            <th className="px-4 py-3">Inactive</th>
                            <th className="px-4 py-3">Rides</th>
                            <th className="px-4 py-3">Spend</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="font-medium">{u.name}</div>
                                    <div className="text-xs text-gray-500">{u.phone}</div>
                                </td>
                                <td className="px-4 py-3 text-center">{u.lastRide}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className="px-2 py-1 text-xs rounded-full bg-red-50 text-red-600">
                                        {u.inactiveDays} days
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">{u.lifetimeRides}</td>
                                <td className="px-4 py-3 text-center">
                                    ₹{u.lifetimeSpend}
                                </td>
                                <td className="px-4 py-3 text-right space-x-3">
                                    <button className="text-blue-600 hover:underline">
                                        View
                                    </button>
                                    <button className="text-green-600 hover:underline">
                                        Send Offer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm border rounded-lg"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
}

export default ChurnedUsersModal;
