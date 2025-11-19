"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectAccessToken } from '@/store/authSlice';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type HistoryItem = {
  _id: string;
  user: string;
  driver?: string;
  vehicleType: string;
  vehicleCategory: string;
  pickupLocation: { address: string; coordinates?: [number, number] };
  dropLocation: { address: string; coordinates?: [number, number] };
  estimatedFare: number;
  estimatedDistance: string;
  otp?: string;
  otpVerified?: boolean;
  status: string;
  cancellationReason?: string;
  cancelledBy?: string;
  completedAt?: string | null;
  verifiedTime?: string | null;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
  cancelledById?: string;
};

const BASE = process.env.NEXT_PUBLIC_BASE_URL;

const DriverHistoryPage = () => {
  const params = useParams();
  const driverId = params?.driverId as string;
  const token = useSelector(selectAccessToken);

  const [isLoading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const currentPage = parseInt(localStorage.getItem('page') || '1');
  const pageSize = 10;

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);

      if (!driverId) {
        setError("Driver ID is missing from the URL.");
        setLoading(false);
        return;
      }
      if (!token) {
        setError("Authentication token is missing. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${BASE}/api/admin/driver/${driverId}/history?page=${page}&limit=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'ngrok-skip-browser-warning': '69420',
            },
          }
        );

        if (response.data && response.data.success !== false) {
          setHistoryData(response.data.data?.driverHistory || []);
          setTotalPages(response.data.data?.totalPages || 10);
        } else {
          setError(response.data?.message || 'Failed to retrieve history data.');
          setHistoryData([]);
        }
      } catch (err) {
        console.error('Failed to fetch History:', err);
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.message || 'Network error or server connection issue.'
            : 'An unexpected error occurred while fetching history.'
        );
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [driverId, token, page]);

  return (
    <div className="p-6 font-inter bg-gray-50 min-h-screen">
      <Link
        href={`/drivers?page=${currentPage}`}
        className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-lg shadow-sm transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10 drop-shadow-md">
        Driver Ride History
      </h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-48 text-gray-600">
          <p>Loading ride history...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-48 text-red-600">
          <p>{error}</p>
        </div>
      ) : historyData.length === 0 ? (
        <div className="flex justify-center items-center h-48 text-gray-500">
          <p>No ride history found for this Driver.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-300 rounded-xl shadow-lg">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 text-blue-700 text-xs ">
                <tr>
                  {/* <th className="px-4 py-3">Ride ID</th> */}
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Pickup</th>
                  <th className="px-4 py-3">Drop</th>
                  <th className="px-4 py-3">Fare</th>
                  <th className="px-4 py-3">Distance</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Cancelled By</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Booked At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historyData.map((ride) => (
                  <tr key={ride._id} className="hover:bg-gray-50 transition">
                    {/* <td className="px-4 py-3">{ride._id}</td> */}
                    <td className="px-4 py-3">
                      {ride.vehicleType} ({ride.vehicleCategory})
                    </td>
                    <td className="px-4 py-3">{ride.pickupLocation.address}</td>
                    <td className="px-4 py-3">{ride.dropLocation.address}</td>
                    <td className="px-4 py-3 font-medium text-green-700">₹{ride.estimatedFare}</td>
                    <td className="px-4 py-3">{ride.estimatedDistance}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          ride.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : ride.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {ride.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {ride.status === 'cancelled' ? ride.cancelledBy ?? 'N/A' : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {ride.status === 'cancelled' ? ride.cancellationReason ?? 'No reason provided' : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(ride.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-8 flex justify-center items-center space-x-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition"
            >
              Previous
            </button>
            <span className="text-gray-600 font-medium">
              Page <span className="font-bold">{page}</span> of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DriverHistoryPage;
